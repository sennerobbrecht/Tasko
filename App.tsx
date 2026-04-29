import { useEffect, useState } from 'react';

import { Alert, LogBox } from 'react-native';
import ParentAccountScreen from './src/screens/ParentAccountScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ForgotPasswordSentScreen from './src/screens/ForgotPasswordSentScreen';
import ChildFamilyCodeScreen from './src/screens/ChildFamilyCodeScreen';
import ChildProfileSetupScreen from './src/screens/ChildProfileSetupScreen';
import ChildHowItWorksScreen from './src/screens/ChildHowItWorksScreen';
import ChildRewardScreen from './src/screens/ChildRewardScreen';
import ChildMonsterSelectionScreen from './src/screens/ChildMonsterSelectionScreen';
import ChildHomeScreen from './src/screens/ChildHomeScreen';
import ChildRewardsShopScreen from './src/screens/ChildRewardsShopScreen';
import ChildAchievementsScreen from './src/screens/ChildAchievementsScreen';
import ChildFocusTimeScreen from './src/screens/ChildFocusTimeScreen';
import ChildMoodScreen from './src/screens/ChildMoodScreen';
import ParentDashboardScreen from './src/screens/ParentDashboardScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import { getSessionUser, signInParent, signOutCurrentUser, signUpParent } from './src/services/auth';
import { ensureFamilyForCurrentUser, loginChildWithCodeAndName } from './src/services/families';
import { MONSTER_COLORS, type AccessoryKey } from './src/components/MonsterPreview';

type User = {
  id: string;
  email: string;
  name: string;
};

type Screen =
  | 'welcome'
  | 'login'
  | 'forgotPassword'
  | 'forgotPasswordSent'
  | 'parentAccount'
  | 'childFamilyCode'
  | 'childProfileSetup'
  | 'childHowItWorks'
  | 'childReward'
  | 'childMonsterSelection'
  | 'childHome'
  | 'childRewardsShop'
  | 'childAchievements'
  | 'childFocusTime'
	| 'childMood'
		| 'premium'
	| 'parentDashboard';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
	const [isAuthBootstrapDone, setIsAuthBootstrapDone] = useState(false);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [pendingInviteCode, setPendingInviteCode] = useState<string | null>(null);
	const [monsterName, setMonsterName] = useState('');
	const [selectedAccessory, setSelectedAccessory] = useState<AccessoryKey | undefined>(undefined);
	const [selectedMonsterColor, setSelectedMonsterColor] = useState<string>(MONSTER_COLORS[0]);
	const [coins] = useState(0);
	const [level] = useState(0);
	const [streakDays] = useState(0);
	const [tasksDone] = useState(0);
	const [badgesUnlocked] = useState(0);
	const [focusSelectedMinutes, setFocusSelectedMinutes] = useState<5 | 10 | 15 | 25 | null>(null);
	const [focusRemainingSeconds, setFocusRemainingSeconds] = useState(0);
	const [focusEndAtMs, setFocusEndAtMs] = useState<number | null>(null);
	const [focusIsRunning, setFocusIsRunning] = useState(false);

	useEffect(() => {
		LogBox.ignoreLogs([
			'THREE.WARNING: Multiple instances of Three.js being imported.',
			'THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.',
			'THREE.WebGLRenderer: EXT_color_buffer_float extension not supported.',
		]);

		const originalWarn = console.warn;
		const originalLog = console.log;

		console.warn = (...args: unknown[]) => {
			const first = String(args[0] ?? '');
			if (
				first.includes('THREE.WARNING: Multiple instances of Three.js being imported.') ||
				first.includes('THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.') ||
				first.includes('THREE.WebGLRenderer: EXT_color_buffer_float extension not supported.')
			) {
				return;
			}
			originalWarn(...args);
		};

		console.log = (...args: unknown[]) => {
			const first = String(args[0] ?? '');
			if (first.includes("EXGL: gl.pixelStorei() doesn't support this parameter yet!")) {
				return;
			}
			originalLog(...args);
		};

		return () => {
			console.warn = originalWarn;
			console.log = originalLog;
		};
	}, []);

	useEffect(() => {
		let isMounted = true;

		const bootstrap = async () => {
			const user = await getSessionUser();
			if (!isMounted) {
				return;
			}

			if (user) {
				const fullName = user.user_metadata?.full_name || '';
				setCurrentUser({
					id: user.id,
					email: user.email || '',
					name: fullName,
				});
				await ensureFamilyForCurrentUser();
				if (isMounted) {
					setScreen('parentDashboard');
				}
			}

			if (isMounted) {
				setIsAuthBootstrapDone(true);
			}
		};

		bootstrap();

		return () => {
			isMounted = false;
		};
	}, []);

	if (!isAuthBootstrapDone) {
		return null;
	}

	if (screen === 'childHome') {
		return (
			<ChildHomeScreen
				monsterName={monsterName}
				selectedAccessory={selectedAccessory}
				selectedMonsterColor={selectedMonsterColor}
				coins={coins}
				level={level}
				streakDays={streakDays}
				tasksDone={tasksDone}
				badgesUnlocked={badgesUnlocked}
				onOpenRewards={() => setScreen('childRewardsShop')}
				onOpenAchievements={() => setScreen('childAchievements')}
				onOpenFocus={() => setScreen('childFocusTime')}
				onOpenMood={() => setScreen('childMood')}
			/>
		);
	}

	if (screen === 'childRewardsShop') {
		return (
			<ChildRewardsShopScreen
				monsterName={monsterName}
				selectedAccessory={selectedAccessory}
				selectedMonsterColor={selectedMonsterColor}
				coins={coins}
				onBack={() => setScreen('childHome')}
				onSelectAccessory={setSelectedAccessory}
			/>
		);
	}

	if (screen === 'childAchievements') {
		return <ChildAchievementsScreen onBack={() => setScreen('childHome')} />;
	}

	if (screen === 'childFocusTime') {
		return (
			<ChildFocusTimeScreen
				monsterName={monsterName}
				selectedAccessory={selectedAccessory}
				selectedMonsterColor={selectedMonsterColor}
				selectedMinutes={focusSelectedMinutes}
				remainingSeconds={focusRemainingSeconds}
				endAtMs={focusEndAtMs}
				isRunning={focusIsRunning}
				onSelectMinutes={(minutes) => {
					setFocusSelectedMinutes(minutes);
					setFocusRemainingSeconds(minutes * 60);
					setFocusIsRunning(false);
					setFocusEndAtMs(null);
				}}
				onToggle={() => {
					if (focusIsRunning) {
						const remaining = focusEndAtMs ? Math.max(0, Math.ceil((focusEndAtMs - Date.now()) / 1000)) : focusRemainingSeconds;
						setFocusRemainingSeconds(remaining);
						setFocusIsRunning(false);
						setFocusEndAtMs(null);
						return;
					}

					if (focusRemainingSeconds <= 0) {
						return;
					}

					setFocusIsRunning(true);
					setFocusEndAtMs(Date.now() + focusRemainingSeconds * 1000);
				}}
				onReset={() => {
					const resetSeconds = focusSelectedMinutes ? focusSelectedMinutes * 60 : 0;
					setFocusRemainingSeconds(resetSeconds);
					setFocusIsRunning(false);
					setFocusEndAtMs(null);
				}}
				onTimeUp={() => {
					setFocusRemainingSeconds(0);
					setFocusIsRunning(false);
					setFocusEndAtMs(null);
				}}
				onBack={() => setScreen('childHome')}
			/>
		);
	}

	if (screen === 'childMood') {
		return <ChildMoodScreen monsterName={monsterName} selectedAccessory={selectedAccessory} selectedMonsterColor={selectedMonsterColor} onBack={() => setScreen('childHome')} />;
	}

	if (screen === 'premium') {
		return <PremiumScreen onBack={() => setScreen('parentDashboard')} />;
	}

	if (screen === 'login') {
		return (
			<LoginScreen
				onBack={() => setScreen('welcome')}
				onForgotPassword={() => setScreen('forgotPassword')}
				onRegister={() => setScreen('parentAccount')}
				onSubmit={async ({ email, password }) => {
					const { error } = await signInParent(email, password);
					if (error) {
						return error.message;
					}

					const user = await getSessionUser();
					if (user) {
						const fullName = user.user_metadata?.full_name || '';
						setCurrentUser({
							id: user.id,
							email: user.email || '',
							name: fullName,
						});
					}

					await ensureFamilyForCurrentUser();
					setScreen('parentDashboard');
					return null;
				}}
			/>
		);
	}

	if (screen === 'forgotPassword') {
		return (
			<ForgotPasswordScreen
				onBack={() => setScreen('login')}
				onSubmit={() => setScreen('forgotPasswordSent')}
			/>
		);
	}

	if (screen === 'forgotPasswordSent') {
		return (
			<ForgotPasswordSentScreen
				onBack={() => setScreen('login')}
				onResend={() => setScreen('forgotPasswordSent')}
			/>
		);
	}

	if (screen === 'childFamilyCode') {
		return (
			<ChildFamilyCodeScreen
				onBack={() => setScreen('welcome')}
				onContinue={(code?: string) => {
					setPendingInviteCode(code ?? null);
					setScreen('childProfileSetup');
				}}
				onLoginChild={async ({ code, username }) => {
					const { data, error } = await loginChildWithCodeAndName(code, username);
					if (error) {
						return error.message;
					}

					setMonsterName(data?.display_name || username.trim());
					setSelectedAccessory(undefined);
					setSelectedMonsterColor(MONSTER_COLORS[0]);
					setScreen('childHome');
					return null;
				}}
			/>
		);
	}

	if (screen === 'childProfileSetup') {
		return (
			<ChildProfileSetupScreen
				onBack={() => setScreen('childFamilyCode')}
				onContinue={() => setScreen('childHowItWorks')}
				inviteCode={pendingInviteCode}
			/>
		);
	}

	if (screen === 'childHowItWorks') {
		return (
			<ChildHowItWorksScreen
				onBack={() => setScreen('childProfileSetup')}
				onSkip={() => setScreen('childMonsterSelection')}
				onContinue={() => setScreen('childReward')}
			/>
		);
	}

	if (screen === 'childReward') {
		return (
			<ChildRewardScreen
				onBack={() => setScreen('childHowItWorks')}
				onContinue={() => setScreen('childMonsterSelection')}
			/>
		);
	}

	if (screen === 'childMonsterSelection') {
		return (
			<ChildMonsterSelectionScreen
				onBack={() => setScreen('childReward')}
				onContinue={(name) => {
					setMonsterName(name.trim());
					setSelectedAccessory(undefined);
					setScreen('childHome');
				}}
			/>
		);
	}

	if (screen === 'parentAccount') {
		return (
			<ParentAccountScreen
				onBack={() => setScreen('welcome')}
				onLogin={() => setScreen('login')}
				onSubmit={async ({ name, email, password, confirmPassword }) => {
					if (password.trim() !== confirmPassword.trim()) {
						return 'Wachtwoorden komen niet overeen.';
					}

					const { error, needsEmailConfirmation, user } = await signUpParent(name, email, password);
					if (error) {
						return error.message;
					}

					// Als email confirmation nodig is, direct goed
					if (needsEmailConfirmation) {
						setScreen('login');
						return null;
					}

					// Account aangemaakt! Nu automatisch inloggen en gezin maken
					const { error: loginError } = await signInParent(email, password);
					if (loginError) {
						return loginError.message;
					}

					// Gebruik de user data van de signUp response
					if (user) {
						const fullName = user.user_metadata?.full_name || '';
						setCurrentUser({
							id: user.id,
							email: user.email || '',
							name: fullName,
						});
					}

					// Maak automatisch een gezin aan
					const { error: familyError } = await ensureFamilyForCurrentUser();
					if (familyError) {
						return `Kon gezin niet aanmaken: ${familyError.message}`;
					}

					setScreen('parentDashboard');
					return null;
				}}
			/>
		);
	}

	if (screen === 'parentDashboard') {
		return <ParentDashboardScreen 
			currentUser={currentUser}
			onOpenPremium={() => setScreen('premium')}
			onLogout={async () => {
				await signOutCurrentUser();
				setCurrentUser(null);
				setScreen('welcome');
			}}
		/>;
	}

	return (
		<WelcomeScreen
			onLogin={() => setScreen('login')}
			onRegisterChild={() => setScreen('childFamilyCode')}
			onRegisterParent={() => setScreen('parentAccount')}
		/>
	);
}
