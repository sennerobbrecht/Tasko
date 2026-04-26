import { Pressable, StyleSheet, Text } from 'react-native';

import colors from '../theme/colors';

type ActionButtonProps = {
  label: string;
  variant: 'primary' | 'secondary' | 'ghost';
  onPress?: () => void;
};

export function ActionButton({ label, variant, onPress }: ActionButtonProps) {
  return (
    <Pressable
      android_ripple={{ color: 'rgba(255, 255, 255, 0.18)' }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'primary' && styles.labelPrimary,
          variant === 'secondary' && styles.labelSecondary,
          variant === 'ghost' && styles.labelSecondary,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 76,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  secondary: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: colors.white,
    borderColor: colors.primarySoft,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },
  label: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  labelPrimary: {
    color: colors.white,
  },
  labelSecondary: {
    color: colors.primaryDark,
  },
});