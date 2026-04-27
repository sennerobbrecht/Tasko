import { useEffect, useMemo, useState } from 'react';

import { StatusBar } from 'expo-status-bar';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, Alert, TextInput, Linking } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import colors from '../theme/colors';
import { getCurrentFamilyRoutines, type RoutineSummary } from '../services/routines';
import { getCurrentFamily, getFamilyChildren, createTeamInviteForCurrentFamily } from '../services/families';
import { supabase } from '../lib/supabase';
import * as Clipboard from 'expo-clipboard';
import { changePassword } from '../services/auth';

type User = {
  id: string;
  email: string;
  name: string;
};

type ParentDashboardScreenProps = {
  currentUser?: User | null;
  onLogout?: () => void;
};

type ParentTab = 'home' | 'insights' | 'planner' | 'profile';
type ShareDuration = '24u' | '48u' | '72u';

type RoutineTask = {
  id: string;
  label: string;
  done: boolean;
};

const TEMPLATES = [
  { id: 'school-week', title: 'School Week', subtitle: 'Perfecte routine voor schooldagen' },
  { id: 'weekend-routine', title: 'Weekend Routine', subtitle: 'Ontspannen en toch structuur' },
  { id: 'zomer-routine', title: 'Zomervakantie', subtitle: 'Zonnige routine voor vrije dagen' },
  { id: 'avond-routine', title: 'Avond Routine', subtitle: 'Rustig afsluiten om beter te slapen' },
  { id: 'verjaardag', title: 'Verjaardagsdag', subtitle: 'Speciale routine voor feestjes' },
  { id: 'zelf', title: 'Zelf Maken', subtitle: 'Maak je eigen familie routine' },
];

export default function ParentDashboardScreen({ currentUser, onLogout }: ParentDashboardScreenProps) {
  const [activeTab, setActiveTab] = useState<ParentTab>('home');
  const [showReadOnlyModal, setShowReadOnlyModal] = useState(false);
  const [showInviteScreen, setShowInviteScreen] = useState(false);
  const [showFamilyTeamSettings, setShowFamilyTeamSettings] = useState(false);
  const [showVisibilitySettings, setShowVisibilitySettings] = useState(false);
  const [showNotificationsSettings, setShowNotificationsSettings] = useState(false);
  const [showAccountSupport, setShowAccountSupport] = useState(false);
  const [shareDuration, setShareDuration] = useState<ShareDuration>('24u');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('school-week');
  const [dbRoutines, setDbRoutines] = useState<RoutineSummary[]>([]);
  const [routinesError, setRoutinesError] = useState<string | null>(null);
  const [routinesLoading, setRoutinesLoading] = useState(true);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [children, setChildren] = useState<Array<{ id: string; display_name: string }>>([]);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [inviteCodeDb, setInviteCodeDb] = useState<string | null>(null);
  const [inviteCodeLocal, setInviteCodeLocal] = useState<string | null>(null);
  const [routineTasks, setRoutineTasks] = useState<RoutineTask[]>([
    { id: 'wake-up', label: 'Opstaan', done: false },
    { id: 'breakfast', label: 'Ontbijten', done: false },
    { id: 'brush', label: 'Tandenpoetsen', done: false },
    { id: 'to-school', label: 'Naar school', done: false },
    { id: 'homework', label: 'Huiswerk', done: false },
    { id: 'dinner', label: 'Avondeten', done: false },
    { id: 'bed', label: 'Naar bed', done: false },
  ]);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((template) => template.id === selectedTemplateId) ?? TEMPLATES[0],
    [selectedTemplateId],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchRoutines = async () => {
      setRoutinesLoading(true);
      setRoutinesError(null);
      const { data, error } = await getCurrentFamilyRoutines();

      if (!isMounted) {
        return;
      }

      if (error) {
        setRoutinesError(error.message);
        setDbRoutines([]);
      } else {
        setDbRoutines(data);
      }

      setRoutinesLoading(false);
    };

    fetchRoutines();

    const fetchFamily = async () => {
      const { family, error } = await getCurrentFamily();
      if (!isMounted) return;
      if (family && family.id) setFamilyId(family.id);
    };

    fetchFamily();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadChildren = async () => {
      setChildrenLoading(true);
      const { data, error } = await getFamilyChildren(familyId ?? undefined);
      if (!mounted) return;
      if (error) {
        setChildren([]);
      } else {
        setChildren(data ?? []);
      }
      setChildrenLoading(false);
    };

    loadChildren();
    let subscription: any;
    if (familyId) {
      subscription = supabase
        .channel('child-profiles')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'child_profiles', filter: `family_id=eq.${familyId}` }, (payload) => {
          const newChild = payload.new as any;
          setChildren((prev) => {
            if (prev.find((p) => p.id === newChild.id)) return prev;
            return [...prev, { id: newChild.id, display_name: newChild.display_name }];
          });
        })
        .subscribe();
    }

    return () => { mounted = false; if (subscription) supabase.removeChannel(subscription); };
  }, [familyId]);

  useEffect(() => {
    let mounted = true;
    if (!showInviteScreen) return;
    // create a local optimistic code so QR/code appears immediately
    const local = generateInviteCode(familyId ?? currentUser?.id);
    setInviteCodeLocal(local);
    setInviteCodeDb(null);

    const createInvite = async () => {
      const { data, error } = await createTeamInviteForCurrentFamily({ code: local });
      if (!mounted) return;
      if (!error && data && data.code) setInviteCodeDb(data.code);
    };
    createInvite();
    return () => { mounted = false; };
  }, [showInviteScreen]);

  function generateInviteCode(userId?: string) {
    if (userId) {
      const cleaned = userId.replace(/-/g, '').toUpperCase();
      return cleaned.slice(0, 10).padEnd(10, 'X');
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let out = '';
    for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }

  async function handleChangePassword() {
    if (newPassword.trim() !== confirmNewPassword.trim()) {
      Alert.alert('Fout', 'Wachtwoorden komen niet overeen.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Fout', 'Wachtwoord moet minstens 6 karakters hebben.');
      return;
    }

    setChangingPassword(true);
    try {
      const { data, error } = await changePassword(newPassword);
      if (error) {
        Alert.alert('Fout', error.message || 'Kon wachtwoord niet wijzigen.');
      } else {
        Alert.alert('Klaar', 'Wachtwoord succesvol gewijzigd.');
        setShowChangePasswordModal(false);
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (e) {
      Alert.alert('Fout', 'Er is iets misgegaan.');
    } finally {
      setChangingPassword(false);
    }
  }

  if (showVisibilitySettings) {
    return (
      <View style={styles.screen}>
        <View style={[styles.header, styles.headerSky]}>
          <Pressable onPress={() => setShowVisibilitySettings(false)} style={styles.headerBackButton}>
            <Text style={styles.headerBackText}>← Terug</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Zichtbaarheid & Toestemming</Text>
          <Text style={styles.headerSubtitle}>Beheer je privacy instellingen</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Zichtbaarheid</Text>
            
            <SettingToggle label="Profiel zichtbaar voor team" defaultValue={true} />
            <SettingToggle label="Voortgang zichtbaar" defaultValue={true} />
            <SettingToggle label="Activiteitslogboek zichtbaar" defaultValue={false} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Toestemmingen</Text>
            
            <SettingToggle label="Teamleden kunnen taken maken" defaultValue={true} />
            <SettingToggle label="Teamleden kunnen voortgang bewerken" defaultValue={true} />
            <SettingToggle label="Teamleden kunnen instellingen wijzigen" defaultValue={false} />
          </View>
        </ScrollView>

        <StatusBar style="dark" />
      </View>
    );
  }

  if (showNotificationsSettings) {
    return (
      <View style={styles.screen}>
        <View style={[styles.header, styles.headerPurple]}>
          <Pressable onPress={() => setShowNotificationsSettings(false)} style={styles.headerBackButton}>
            <Text style={styles.headerBackText}>← Terug</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Meldingen</Text>
          <Text style={styles.headerSubtitle}>Pas je notificaties aan</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Taak Meldingen</Text>
            
            <SettingToggle label="Taak voltooid" defaultValue={true} />
            <SettingToggle label="Taak gemist" defaultValue={true} />
            <SettingToggle label="Routines bijgewerkt" defaultValue={true} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Team Meldingen</Text>
            
            <SettingToggle label="Teamlid toegevoegd" defaultValue={true} />
            <SettingToggle label="Opmerkingen ontvangen" defaultValue={true} />
            <SettingToggle label="Updates van team" defaultValue={false} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pluim Meldingen</Text>
            
            <SettingToggle label="Behaald badge" defaultValue={true} />
            <SettingToggle label="Streak voltooid" defaultValue={true} />
          </View>
        </ScrollView>

        <StatusBar style="dark" />
      </View>
    );
  }

  if (showAccountSupport) {
    return (
      <View style={styles.screen}>
        <View style={[styles.header, styles.headerPink]}>
          <Pressable onPress={() => setShowAccountSupport(false)} style={styles.headerBackButton}>
            <Text style={styles.headerBackText}>← Terug</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Account & Support</Text>
          <Text style={styles.headerSubtitle}>Help & Accountinstellingen</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Account Info</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{currentUser?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Type:</Text>
              <Text style={styles.infoValue}>Ouder / Begeleider</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Lid sinds:</Text>
              <Text style={styles.infoValue}>April 27, 2026</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Wachtwoord & Beveiliging</Text>
            
            <Pressable onPress={() => setShowChangePasswordModal(true)} style={[styles.actionButton, styles.actionSecondary]}>
              <Text style={styles.actionSecondaryText}>Wachtwoord wijzigen</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hulp & Support</Text>
            
            <MenuRow label="Veelgestelde vragen" onPress={() => setShowFAQModal(true)} />
            <MenuRow label="Contact Support" onPress={() => Linking.openURL('mailto:support@tasko.app')} />
            <MenuRow label="Verzend Feedback" onPress={() => Linking.openURL('mailto:feedback@tasko.app?subject=Tasko%20Feedback')} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Gevaarlijk Gebied</Text>
            
            <Pressable style={[styles.actionButton, { backgroundColor: '#FFE5EA', marginTop: 8 }]}>
              <Text style={{ color: '#D84C63', fontSize: 14, fontWeight: '700' }}>Account Verwijderen</Text>
            </Pressable>
          </View>
        </ScrollView>

        <StatusBar style="dark" />
      </View>
    );
  }

  if (showFamilyTeamSettings) {
    return (
      <View style={styles.screen}>
        <View style={[styles.header, styles.headerMint]}>
          <Pressable onPress={() => setShowFamilyTeamSettings(false)} style={styles.headerBackButton}>
            <Text style={styles.headerBackText}>← Terug</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Family & Team</Text>
          <Text style={styles.headerSubtitle}>Beheer je familie en teamleden</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Gezinsleden</Text>
            <Text style={styles.subtleText}>Ouders en begeleiders</Text>
            
            <View style={styles.memberItem}>
              <Text style={styles.memberName}>👤 {currentUser?.name || 'Jij'}</Text>
              <Text style={styles.memberEmail}>{currentUser?.email}</Text>
              <Text style={styles.memberRole}>Eigenaar</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Jouw Kinderen</Text>
            <Text style={styles.subtleText}>Kids die je beheert</Text>

            {childrenLoading ? (
              <Text style={styles.supportText}>Laden…</Text>
            ) : children.length === 0 ? (
              <View>
                <Text style={{ marginBottom: 8, color: '#6C7A8E' }}>Er zijn nog geen kinderen gekoppeld aan dit gezin.</Text>
                <Pressable onPress={() => { setShowFamilyTeamSettings(false); setShowInviteScreen(true); }} style={[styles.actionButton, styles.actionPrimary]}>
                  <Text style={styles.actionPrimaryText}>Voeg een kind toe</Text>
                </Pressable>
              </View>
            ) : (
              children.map((c) => (
                <View key={c.id} style={styles.memberItem}>
                  <Text style={styles.memberName}>👧 {c.display_name}</Text>
                  <Text style={styles.memberEmail}>Voortgang: 0%</Text>
                  <Text style={styles.memberRole}>Actief</Text>
                </View>
              ))
            )}

            {children.length > 0 && (
              <>
                <View style={{ height: 8 }} />
                <Pressable onPress={() => { setShowFamilyTeamSettings(false); setShowInviteScreen(true); }} style={[styles.actionButton, styles.actionSecondary]}>
                  <Text style={styles.actionSecondaryText}>+ Kind toevoegen</Text>
                </Pressable>
              </>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Teaminstellingen</Text>
            <MenuRow label="Privacy & Zichtbaarheid" />
            <MenuRow label="Toestemmingen" />
            <MenuRow label="Data opslag" />
          </View>
        </ScrollView>

        <StatusBar style="dark" />
      </View>
    );
  }

  if (showInviteScreen) {
    const inviteCode = inviteCodeDb ?? inviteCodeLocal ?? null;
    const inviteLink = inviteCode ? `tasko://invite?code=${inviteCode}` : null;
    
    return (
      <View style={styles.screen}>
        <View style={[styles.header, styles.headerPink]}>
          <Pressable onPress={() => { setShowInviteScreen(false); setInviteCodeDb(null); setInviteCodeLocal(null); }} style={styles.headerBackButton}>
            <Text style={styles.headerBackText}>← Terug</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Uitnodigen voor Team</Text>
          <Text style={styles.headerSubtitle}>Nodig andere ouders of begeleiders uit</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Scan de QR Code</Text>
            <View style={styles.qrFrame}>
              {inviteCode ? (
                <QRCode value={inviteLink!} size={200} color="black" backgroundColor="white" />
              ) : (
                <Text style={styles.supportText}>Even wachten terwijl de uitnodiging wordt aangemaakt…</Text>
              )}
            </View>
            <Text style={styles.supportText}>Laat anderen deze code scannen om lid te worden van je team</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Deel de uitnodigingscode</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{inviteCode ?? '—'}</Text>
            </View>

            <View style={styles.inlineActions}>
              <Pressable
                onPress={async () => {
                  if (!inviteCode) {
                    Alert.alert('Wachten', 'De uitnodiging wordt nog aangemaakt. Probeer het over een paar seconden opnieuw.');
                    return;
                  }
                  try {
                    await Clipboard.setStringAsync(inviteCode);
                    Alert.alert('Gekopieerd', 'De uitnodigingscode is gekopieerd naar het klembord.');
                  } catch (e) {
                    Alert.alert('Fout', 'Kon de code niet kopiëren.');
                  }
                }}
                style={[styles.actionButton, inviteCode ? styles.actionPrimary : styles.actionSecondary]}
              >
                <Text style={inviteCode ? styles.actionPrimaryText : styles.actionSecondaryText}>Kopieer Code</Text>
              </Pressable>
              <Pressable onPress={() => inviteLink && Linking.openURL(inviteLink)} style={[styles.actionButton, styles.actionSecondary]}>
                <Text style={styles.actionSecondaryText}>Deel</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hoe werkt het?</Text>
            <Text style={styles.helperStep}>1. Deel de QR code of uitnodigingscode</Text>
            <Text style={styles.helperStep}>2. De ander voert de code in via de app</Text>
            <Text style={styles.helperStep}>3. Je team is klaar om samen routines te beheren</Text>
          </View>
        </ScrollView>

        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.header,
          activeTab === 'home' && styles.headerMint,
          activeTab === 'insights' && styles.headerSky,
          activeTab === 'planner' && styles.headerPurple,
          activeTab === 'profile' && styles.headerMint,
        ]}
      >
        <Text style={styles.headerTitle}>
          {activeTab === 'home' && `Welkom terug, ${currentUser?.name || 'Ouder'} 👋`}
          {activeTab === 'insights' && 'Inzichten'}
          {activeTab === 'planner' && 'Kies een Template'}
          {activeTab === 'profile' && 'Instellingen'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {activeTab === 'home' && 'Hier is je basis dashboard voor het gezin'}
          {activeTab === 'insights' && 'Bekijk trends en deel alleen-lezen toegang'}
          {activeTab === 'planner' && 'Begin met een kant-en-klare routine'}
          {activeTab === 'profile' && 'Beheer je account en voorkeuren'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'home' && (
          <>
            <View style={[styles.card, styles.progressCard]}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>Emma's Voortgang</Text>
                <Text style={styles.smallBadge}>Vandaag bijgewerkt</Text>
              </View>

              <View style={styles.progressShell}>
                <View style={[styles.progressFill, { width: '80%' }]} />
              </View>
              <Text style={styles.supportText}>12 van 15 taken voltooid</Text>

              <View style={styles.statGrid}>
                <StatCard label="Streak" value="7 dagen" />
                <StatCard label="Voltooid" value="12/15" />
                <StatCard label="Focus" value="85%" />
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>Actieve Routines</Text>
                <Text style={styles.subtleText}>{dbRoutines.length} gevonden</Text>
              </View>

              {routinesLoading ? <Text style={styles.subtleText}>Routines laden...</Text> : null}
              {routinesError ? <Text style={styles.errorText}>{routinesError}</Text> : null}

              {!routinesLoading && !routinesError && dbRoutines.length === 0 ? (
                <Text style={styles.subtleText}>Nog geen routines. Maak er een via Planner.</Text>
              ) : null}

              {!routinesLoading && !routinesError
                ? dbRoutines.slice(0, 3).map((routine, index) => (
                    <RoutineRow
                      key={routine.id}
                      title={routine.title}
                      time={routine.is_active ? 'Actief' : 'Inactief'}
                      tone={index % 3 === 0 ? 'mint' : index % 3 === 1 ? 'sky' : 'pink'}
                    />
                  ))
                : null}
            </View>

            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>Snelle Acties</Text>
              </View>
              <View style={styles.quickActionsRow}>
                <Pressable onPress={() => setActiveTab('insights')} style={styles.quickAction}>
                  <Text style={styles.quickActionTitle}>Basis Inzichten</Text>
                  <Text style={styles.quickActionSubtitle}>Bekijk dag en week overzicht</Text>
                </Pressable>
                <Pressable onPress={() => setActiveTab('planner')} style={styles.quickAction}>
                  <Text style={styles.quickActionTitle}>Routine Builder</Text>
                  <Text style={styles.quickActionSubtitle}>Stel taken voor morgen in</Text>
                </Pressable>
              </View>
            </View>
          </>
        )}

        {activeTab === 'insights' && (
          <>
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>Deze week</Text>
                <Pressable onPress={() => setShowReadOnlyModal(true)} style={styles.iconAction}>
                  <Text style={styles.iconActionText}>Delen</Text>
                </Pressable>
              </View>

              <View style={styles.dayTabs}>
                {['Ma', 'Di', 'Wo', 'Do', 'Vr'].map((day, index) => (
                  <View key={day} style={[styles.dayTab, index === 0 && styles.dayTabActive]}>
                    <Text style={[styles.dayTabText, index === 0 && styles.dayTabTextActive]}>{day}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.emojiRow}>
                {['🙂', '😊', '😐', '😕', '😴'].map((emoji) => (
                  <View key={emoji} style={styles.emojiPill}>
                    <Text>{emoji}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.chartShell}>
                <View style={[styles.chartBar, { height: 46 }]} />
                <View style={[styles.chartBar, { height: 74 }]} />
                <View style={[styles.chartBar, { height: 62 }]} />
                <View style={[styles.chartBar, { height: 80 }]} />
                <View style={[styles.chartBar, { height: 50 }]} />
                <View style={[styles.chartBar, { height: 66 }]} />
                <View style={[styles.chartBar, { height: 58 }]} />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Routines</Text>
              {dbRoutines.length === 0 ? <TaskInsightRow label="Nog geen routines" /> : null}
              {dbRoutines.slice(0, 3).map((routine) => (
                <TaskInsightRow key={routine.id} label={routine.title} />
              ))}
            </View>
          </>
        )}

        {activeTab === 'planner' && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Populair</Text>
              <View style={styles.templateGrid}>
                {TEMPLATES.slice(0, 2).map((template) => (
                  <TemplateCard
                    key={template.id}
                    title={template.title}
                    subtitle={template.subtitle}
                    selected={selectedTemplateId === template.id}
                    onPress={() => setSelectedTemplateId(template.id)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Alle Templates</Text>
              {TEMPLATES.slice(2).map((template) => (
                <Pressable key={template.id} onPress={() => setSelectedTemplateId(template.id)} style={styles.templateRow}>
                  <View>
                    <Text style={styles.templateRowTitle}>{template.title}</Text>
                    <Text style={styles.templateRowSubtitle}>{template.subtitle}</Text>
                  </View>
                  <Text style={styles.templateRowAction}>{selectedTemplateId === template.id ? 'Actief' : 'Gebruik'}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{selectedTemplate.title}</Text>
                <Pressable style={styles.addButton}>
                  <Text style={styles.addButtonText}>+ Toevoegen</Text>
                </Pressable>
              </View>

              {routineTasks.map((task) => (
                <Pressable
                  key={task.id}
                  onPress={() =>
                    setRoutineTasks((prev) =>
                      prev.map((row) => (row.id === task.id ? { ...row, done: !row.done } : row)),
                    )
                  }
                  style={[styles.taskRow, task.done && styles.taskRowDone]}
                >
                  <View style={[styles.checkbox, task.done && styles.checkboxActive]}>
                    <Text style={styles.checkboxText}>{task.done ? '✓' : ''}</Text>
                  </View>
                  <Text style={styles.taskText}>{task.label}</Text>
                  <Text style={styles.deleteTask}>🗑</Text>
                </Pressable>
              ))}

              <Pressable style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Routine Opslaan</Text>
              </Pressable>
            </View>
          </>
        )}

        {activeTab === 'profile' && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{currentUser?.name || 'Mijn Account'}</Text>
              <Text style={styles.subtleText}>{currentUser?.email || 'email@example.com'}</Text>
              <Text style={styles.inlineTag}>BASIS</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Account</Text>
              <MenuRow label="Family & Team Settings" onPress={() => setShowFamilyTeamSettings(true)} />
              <MenuRow label="Invite to Team" onPress={() => setShowInviteScreen(true)} />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              <MenuRow label="Visibility & Permissions" onPress={() => setShowVisibilitySettings(true)} />
              <MenuRow label="Notifications" onPress={() => setShowNotificationsSettings(true)} />
              <MenuRow label="Account & Support" onPress={() => setShowAccountSupport(true)} />
            </View>

            <Pressable onPress={onLogout} style={[styles.actionButton, styles.logoutButton]}>
              <Text style={styles.actionSecondaryText}>Uitloggen</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <BottomTab label="Home" active={activeTab === 'home'} onPress={() => setActiveTab('home')} />
        <BottomTab label="Inzichten" active={activeTab === 'insights'} onPress={() => setActiveTab('insights')} />
        <BottomTab label="Planner" active={activeTab === 'planner'} onPress={() => setActiveTab('planner')} />
        <BottomTab label="Profiel" active={activeTab === 'profile'} onPress={() => setActiveTab('profile')} />
      </View>

      <Modal transparent visible={showReadOnlyModal} animationType="fade" onRequestClose={() => setShowReadOnlyModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Deel de alleen-lezen link</Text>
            <Text style={styles.modalSubtitle}>Kies hoelang de link geldig blijft</Text>

            <View style={styles.durationRow}>
              {(['24u', '48u', '72u'] as const).map((duration) => (
                <Pressable
                  key={duration}
                  onPress={() => setShareDuration(duration)}
                  style={[styles.durationPill, shareDuration === duration && styles.durationPillActive]}
                >
                  <Text style={[styles.durationText, shareDuration === duration && styles.durationTextActive]}>{duration}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable onPress={() => setShowReadOnlyModal(false)} style={styles.generateButton}>
              <Text style={styles.generateButtonText}>Link genereren</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showFAQModal} animationType="slide" onRequestClose={() => setShowFAQModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCardLarge}>
            <Text style={styles.modalTitle}>Veelgestelde vragen</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              <Text style={styles.faqQuestion}>Hoe voeg ik een kind toe?</Text>
              <Text style={styles.faqAnswer}>Gebruik 'Invite to Team' om een ouder of begeleider uit te nodigen. De ander kan de uitnodiging gebruiken om gekoppeld te worden.</Text>

              <Text style={styles.faqQuestion}>Wat doet 'Visibility'?</Text>
              <Text style={styles.faqAnswer}>Je bepaalt welke informatie teamleden kunnen zien, zoals voortgang en activiteiten.</Text>

              <Text style={styles.faqQuestion}>Kan ik mijn wachtwoord wijzigen?</Text>
              <Text style={styles.faqAnswer}>Ja — kies 'Wachtwoord wijzigen' in Account & Support en voer een nieuw wachtwoord in.</Text>
            </ScrollView>

            <Pressable onPress={() => setShowFAQModal(false)} style={styles.generateButton}>
              <Text style={styles.generateButtonText}>Sluiten</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showChangePasswordModal} animationType="slide" onRequestClose={() => setShowChangePasswordModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCardLarge}>
            <Text style={styles.modalTitle}>Wachtwoord wijzigen</Text>
            <Text style={styles.modalSubtitle}>Voer een nieuw wachtwoord in</Text>

            <TextInput
              placeholder="Nieuw wachtwoord"
              placeholderTextColor="#B8C7D4"
              secureTextEntry
              style={styles.modalInput}
              value={newPassword}
              onChangeText={setNewPassword}
              autoComplete="off"
              importantForAutofill="no"
              textContentType="none"
            />
            <TextInput
              placeholder="Bevestig nieuw wachtwoord"
              placeholderTextColor="#B8C7D4"
              secureTextEntry
              style={styles.modalInput}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              autoComplete="off"
              importantForAutofill="no"
              textContentType="none"
            />

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable onPress={() => setShowChangePasswordModal(false)} style={[styles.actionButton, styles.actionSecondary]}>
                <Text style={styles.actionSecondaryText}>Annuleer</Text>
              </Pressable>
              <Pressable onPress={handleChangePassword} style={[styles.actionButton, styles.actionPrimary]}>
                <Text style={styles.actionPrimaryText}>{changingPassword ? 'Bezig...' : 'Opslaan'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <StatusBar style="dark" />
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function RoutineRow({ title, time, tone }: { title: string; time: string; tone: 'mint' | 'sky' | 'pink' }) {
  return (
    <View
      style={[
        styles.routineRow,
        tone === 'mint' && styles.routineMint,
        tone === 'sky' && styles.routineSky,
        tone === 'pink' && styles.routinePink,
      ]}
    >
      <Text style={styles.routineTitle}>{title}</Text>
      <Text style={styles.routineTime}>{time}</Text>
    </View>
  );
}

function TaskInsightRow({ label }: { label: string }) {
  return (
    <View style={styles.taskInsightRow}>
      <Text style={styles.taskInsightText}>{label}</Text>
      <Text style={styles.taskInsightDelete}>✕</Text>
    </View>
  );
}

function TemplateCard({
  title,
  subtitle,
  selected,
  onPress,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.templateCard, selected && styles.templateCardSelected]}>
      <Text style={styles.templateCardTitle}>{title}</Text>
      <Text style={styles.templateCardSubtitle}>{subtitle}</Text>
      <Text style={styles.templateCardHint}>{selected ? 'Geselecteerd' : 'Selecteer'}</Text>
    </Pressable>
  );
}

function MenuRow({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.menuRow}>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </Pressable>
  );
}

function SettingToggle({ label, defaultValue }: { label: string; defaultValue: boolean }) {
  const [enabled, setEnabled] = useState(defaultValue);
  
  return (
    <View style={styles.settingToggleRow}>
      <Text style={styles.settingToggleLabel}>{label}</Text>
      <Pressable onPress={() => setEnabled(!enabled)} style={[styles.toggleSwitch, enabled && styles.toggleSwitchEnabled]}>
        <View style={[styles.toggleCircle, enabled && styles.toggleCircleEnabled]} />
      </Pressable>
    </View>
  );
}

function BottomTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.bottomTab, active && styles.bottomTabActive]}>
      <Text style={[styles.bottomTabLabel, active && styles.bottomTabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 42,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerMint: {
    backgroundColor: '#4CC9D8',
  },
  headerSky: {
    backgroundColor: '#42C7D5',
  },
  headerPurple: {
    backgroundColor: '#8079E8',
  },
  headerPink: {
    backgroundColor: '#F36FA2',
  },
  headerTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    color: colors.white,
  },
  headerSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#EAF9FC',
    fontWeight: '600',
  },
  headerBackButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingVertical: 8,
  },
  headerBackText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 120,
    gap: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#DDECF0',
    padding: 14,
    gap: 10,
    shadowColor: colors.shadow,
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  progressCard: {
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textStrong,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#738194',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  smallBadge: {
    fontSize: 12,
    color: '#5F68C9',
    backgroundColor: '#EDF1FF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    fontWeight: '700',
  },
  progressShell: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E8EEF2',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#736FE8',
  },
  supportText: {
    color: '#8A97A9',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  helperStep: {
    color: '#6C7A8E',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  subtleText: {
    color: '#8A97A9',
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    color: '#D84C63',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  statGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E1ECF0',
    backgroundColor: '#F7FBFC',
    paddingVertical: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textStrong,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 12,
    color: '#8A97A9',
    fontWeight: '700',
  },
  routineRow: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E1ECF0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routineMint: {
    backgroundColor: '#EEFFF8',
  },
  routineSky: {
    backgroundColor: '#F1FDFF',
  },
  routinePink: {
    backgroundColor: '#FFF4F7',
  },
  routineTitle: {
    fontSize: 15,
    color: colors.textStrong,
    fontWeight: '800',
  },
  routineTime: {
    fontSize: 13,
    color: '#8492A2',
    fontWeight: '700',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickAction: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCEBF0',
    backgroundColor: '#F8FCFD',
    padding: 12,
  },
  quickActionTitle: {
    color: colors.textStrong,
    fontSize: 15,
    fontWeight: '800',
  },
  quickActionSubtitle: {
    marginTop: 4,
    color: '#8694A3',
    fontSize: 12,
    lineHeight: 16,
  },
  dayTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  dayTab: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DAE9EE',
    backgroundColor: '#F8FCFD',
  },
  dayTabActive: {
    backgroundColor: '#44C3D2',
    borderColor: '#44C3D2',
  },
  dayTabText: {
    color: '#8794A4',
    fontWeight: '700',
  },
  dayTabTextActive: {
    color: colors.white,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emojiPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F9FB',
    borderWidth: 1,
    borderColor: '#E1EDF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartShell: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E1ECF0',
    backgroundColor: '#F9FCFD',
    minHeight: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 8,
    paddingTop: 10,
    gap: 6,
  },
  chartBar: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#AFEAF1',
  },
  iconAction: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ECFBFD',
    borderWidth: 1,
    borderColor: '#CDEDF2',
  },
  iconActionText: {
    color: '#2B8EA0',
    fontWeight: '700',
    fontSize: 12,
  },
  taskInsightRow: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4EEF2',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FCFD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskInsightText: {
    color: colors.textStrong,
    fontWeight: '700',
    fontSize: 15,
  },
  taskInsightDelete: {
    color: '#EF7E8B',
    fontSize: 16,
    fontWeight: '700',
  },
  templateGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  templateCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DEEAF0',
    backgroundColor: '#F9FCFD',
    padding: 12,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  templateCardSelected: {
    borderColor: '#7B73E8',
    backgroundColor: '#F2F1FF',
  },
  templateCardTitle: {
    color: colors.textStrong,
    fontSize: 16,
    fontWeight: '900',
  },
  templateCardSubtitle: {
    color: '#8794A3',
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
  },
  templateCardHint: {
    marginTop: 8,
    color: '#46B8C8',
    fontSize: 12,
    fontWeight: '700',
  },
  templateRow: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E1ECF1',
    backgroundColor: '#F8FCFD',
    paddingVertical: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateRowTitle: {
    color: colors.textStrong,
    fontSize: 15,
    fontWeight: '800',
  },
  templateRowSubtitle: {
    marginTop: 2,
    color: '#8794A3',
    fontSize: 12,
  },
  templateRowAction: {
    color: '#2EA7B8',
    fontSize: 13,
    fontWeight: '700',
  },
  addButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BFEAF0',
    backgroundColor: '#ECFBFD',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addButtonText: {
    color: '#2E93A2',
    fontSize: 12,
    fontWeight: '700',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E1ECF1',
    backgroundColor: '#F8FCFD',
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 10,
  },
  taskRowDone: {
    backgroundColor: '#F0FFFA',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#CFE6EC',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    borderColor: '#3FBFB0',
    backgroundColor: '#3FBFB0',
  },
  checkboxText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  taskText: {
    flex: 1,
    color: colors.textStrong,
    fontWeight: '700',
    fontSize: 15,
  },
  deleteTask: {
    color: '#F08B97',
    fontSize: 15,
  },
  saveButton: {
    marginTop: 4,
    borderRadius: 14,
    backgroundColor: '#42C7D5',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  inlineTag: {
    alignSelf: 'flex-start',
    marginTop: 4,
    fontSize: 12,
    fontWeight: '800',
    color: '#F6A81A',
    backgroundColor: '#FFF3D8',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  menuRow: {
    borderTopWidth: 1,
    borderTopColor: '#E8F0F3',
    paddingTop: 12,
    paddingBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuLabel: {
    color: colors.textStrong,
    fontSize: 15,
    fontWeight: '700',
  },
  menuArrow: {
    color: '#A2AFBC',
    fontSize: 20,
  },
  memberItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1ECF0',
    backgroundColor: '#F8FCFD',
    padding: 14,
    marginVertical: 8,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textStrong,
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 13,
    color: '#8794A4',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 12,
    fontWeight: '700',
    color: '#42C7D5',
    backgroundColor: '#E6FBFD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8F0F3',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8794A4',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textStrong,
  },
  settingToggleRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8F0F3',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingToggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textStrong,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E1ECF0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchEnabled: {
    backgroundColor: '#42C7D5',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  toggleCircleEnabled: {
    alignSelf: 'flex-end',
  },
  actionButton: {
    minHeight: 46,
    borderRadius: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimary: {
    flex: 1,
    backgroundColor: '#42C7D5',
  },
  actionSecondary: {
    backgroundColor: '#F4F8FA',
    borderWidth: 1,
    borderColor: '#DCEAF0',
    minWidth: 84,
  },
  actionPrimaryText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  actionSecondaryText: {
    color: colors.textStrong,
    fontSize: 14,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: '#F7FCFD',
    borderWidth: 1,
    borderColor: '#D9EBF0',
  },
  inlineActions: {
    flexDirection: 'row',
    gap: 8,
  },
  qrFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  qrOuter: {
    width: 190,
    height: 190,
    borderWidth: 3,
    borderColor: '#43B9C8',
    borderRadius: 14,
    padding: 10,
    backgroundColor: colors.white,
    justifyContent: 'space-between',
  },
  qrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    gap: 5,
  },
  qrCell: {
    flex: 1,
    backgroundColor: '#E4ECEF',
    borderRadius: 2,
  },
  qrCellDark: {
    backgroundColor: '#1A1E24',
  },
  codeBox: {
    minHeight: 72,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#BFEAF0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5FDFF',
  },
  codeText: {
    fontSize: 34,
    color: '#2E95A5',
    fontWeight: '900',
    letterSpacing: 1,
  },
  bottomNav: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8EAF0',
    backgroundColor: colors.white,
    flexDirection: 'row',
    padding: 6,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  bottomTab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomTabActive: {
    backgroundColor: '#DDF5F8',
  },
  bottomTabLabel: {
    color: '#8A97A9',
    fontWeight: '700',
    fontSize: 12,
  },
  bottomTabLabelActive: {
    color: '#2B8D9D',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 26, 34, 0.36)',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DAEAF0',
    gap: 12,
  },
  modalCardLarge: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DAEAF0',
    gap: 12,
    maxHeight: 520,
  },
  modalTitle: {
    color: colors.textStrong,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#8391A1',
    fontSize: 13,
    textAlign: 'center',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationPill: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBEAF0',
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5FCFD',
  },
  durationPillActive: {
    borderColor: '#42C7D5',
    backgroundColor: '#42C7D5',
  },
  durationText: {
    color: '#2D93A2',
    fontWeight: '700',
  },
  durationTextActive: {
    color: colors.white,
  },
  generateButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#42C7D5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E1ECF0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    marginBottom: 6,
    backgroundColor: '#FAFEFF',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textStrong,
    marginTop: 12,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#6C7A8E',
    marginTop: 6,
  },
});
