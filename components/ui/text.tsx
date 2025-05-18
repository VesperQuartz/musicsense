import { Inter_400Regular, Inter_900Black, useFonts } from '@expo-google-fonts/inter';
import * as Slot from '@rn-primitives/slot';
import type { SlottableTextProps, TextRef } from '@rn-primitives/types';
import * as React from 'react';
import { Text as RNText } from 'react-native';

import { cn } from '@/lib/utils';

const TextClassContext = React.createContext<string | undefined>(undefined);

const Text = React.forwardRef<TextRef, SlottableTextProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const textClass = React.useContext(TextClassContext);
    const Component = asChild ? Slot.Text : RNText;
    const [fontsLoaded] = useFonts({ Inter_900Black, Inter_400Regular });
    if (!fontsLoaded) return null;
    return (
      <Component
        style={{
          fontFamily: 'Inter_400Regular',
        }}
        className={cn('text-base  text-foreground web:select-text', textClass, className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Text.displayName = 'Text';

export { Text, TextClassContext };
