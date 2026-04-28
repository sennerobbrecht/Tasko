import { useEffect, useState } from 'react';

import { Alert } from 'react-native';
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
import { getSessionUser, signInParent, signOutCurrentUser, signUpParent } from './src/services/auth';
import { ensureFamilyForCurrentUser } from './src/services/families';
import type { AccessoryKey } from './src/components/MonsterPreview';

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
	| 'parentDashboard';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
	const [isAuthBootstrapDone, setIsAuthBootstrapDone] = useState(false);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [pendingInviteCode, setPendingInviteCode] = useState<string | null>(null);
	const [monsterName, setMonsterName] = useState('');
	const [selectedAccessory, setSelectedAccessory] = useState<AccessoryKey | undefined>(undefined);
	const [coins] = useState(0);
	const [level] = useState(0);
	const [streakDays] = useState(0);
	const [tasksDone] = useState(0);
	const [badgesUnlocked] = useState(0);

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
		return <ChildFocusTimeScreen monsterName={monsterName} selectedAccessory={selectedAccessory} onBack={() => setScreen('childHome')} />;
	}

	if (screen === 'childMood') {
		return <ChildMoodScreen monsterName={monsterName} selectedAccessory={selectedAccessory} onBack={() => setScreen('childHome')} />;
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

					const { error, needsEmailConfirmation } = await signUpParent(name, email, password);
					if (error) {
						return error.message;
					}

					// Account aangemaakt! Nu automatisch inloggen en gezin maken
					const { error: loginError } = await signInParent(email, password);
					if (loginError) {
						return loginError.message;
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

					// Maak automatisch een gezin aan
					await ensureFamilyForCurrentUser();
					setScreen('parentDashboard');
					return null;
				}}
			/>
		);
	}

	if (screen === 'parentDashboard') {
		return <ParentDashboardScreen 
			currentUser={currentUser}
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
