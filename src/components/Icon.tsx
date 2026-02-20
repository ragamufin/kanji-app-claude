/**
 * Icon — thin wrapper around Feather icons for consistent sizing and imports.
 */

import React from 'react';
import { Feather } from '@expo/vector-icons';

export type IconName = React.ComponentProps<typeof Feather>['name'];

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 20, color = '#000' }: IconProps) {
  return <Feather name={name} size={size} color={color} />;
}
