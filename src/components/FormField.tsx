import { Pressable, StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';

import colors from '../theme/colors';

type FormFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: string;
  secureTextEntry?: boolean;
  showPassword?: boolean;
  onTogglePasswordVisibility?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  shellStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoFocus?: boolean;
  editable?: boolean;
};

export default function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry,
  showPassword,
  onTogglePasswordVisibility,
  containerStyle,
  shellStyle,
  inputStyle,
  keyboardType,
  autoCapitalize,
  autoFocus,
  editable,
}: FormFieldProps) {
  return (
    <View style={[styles.fieldGroup, containerStyle]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputShell, shellStyle]}>
        {icon ? <Text style={styles.fieldIcon}>{icon}</Text> : null}
        <TextInput
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoFocus={autoFocus}
          editable={editable}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#B8C7D4"
          autoComplete="off"
          importantForAutofill="no"
          textContentType="none"
          secureTextEntry={secureTextEntry}
          style={[styles.input, inputStyle]}
          value={value}
        />
        {secureTextEntry !== undefined && onTogglePasswordVisibility ? (
          <Pressable onPress={onTogglePasswordVisibility} style={styles.eyeButton}>
            <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: { gap: 10 },
  fieldLabel: { color: colors.textStrong, fontSize: 18, lineHeight: 22, fontWeight: '800' },
  inputShell: {
    minHeight: 72,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#DDECF0',
    backgroundColor: colors.white,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 18,
    gap: 12,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  fieldIcon: { fontSize: 22, color: '#96A2B0' },
  input: { flex: 1, minHeight: 48, fontSize: 18, color: colors.textStrong, paddingVertical: 0 },
  eyeButton: { padding: 4 },
  eyeIcon: { fontSize: 18, color: '#96A2B0' },
});