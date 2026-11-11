import { useState } from "react";
import {
    Pressable,
    StyleSheet,
    type PressableProps,
    type PressableStateCallbackType,
    type StyleProp,
    type ViewStyle,
} from "react-native";

type AccessibleButtonProps = Omit<PressableProps, "style"> & {
  style?:
    | StyleProp<ViewStyle>
    | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
  focusStyle?: StyleProp<ViewStyle>;
};

export default function AccessibleButton({
  children,
  style,
  focusStyle,
  disabled,
  onFocus,
  onBlur,
  ...props
}: AccessibleButtonProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Pressable
      {...props}
      disabled={disabled}
      focusable={!disabled}
      onFocus={(event) => {
        setIsFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setIsFocused(false);
        onBlur?.(event);
      }}
      style={(state) => {
        const resolvedStyle =
          typeof style === "function" ? style(state) : style;

        return [
          styles.base,
          resolvedStyle,
          state.hovered && !disabled && styles.hovered,
          isFocused && styles.focusVisible,
          isFocused && focusStyle,
          state.pressed && styles.pressed,
        ];
      }}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minWidth: 44,
    minHeight: 44,
  },
  pressed: {
    opacity: 0.84,
  },
  hovered: {
    opacity: 0.92,
  },
  focusVisible: {
    borderWidth: 2,
    borderColor: "#1F3D7A",
    shadowColor: "#1F3D7A",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
});
