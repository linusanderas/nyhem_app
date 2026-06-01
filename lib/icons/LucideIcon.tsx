import React from 'react';
import * as LucideIcons from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { memo, useMemo } from 'react';

type IconName = keyof typeof LucideIcons;
type IconProps = { name: string; className?: string; size?: number; strokeWidth?: number };

const toPascalCase = (str: string): string => {
  return str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase()).replace(/^./, (s) => s.toUpperCase());
};

const Icon: React.FC<IconProps> = memo(({ name, className, size = 24, strokeWidth = 2, ...rest }) => {
  const CustomIcon = useMemo(() => {
    const pascalName = toPascalCase(name) as IconName;
    const IconComponent = LucideIcons[pascalName] ?? LucideIcons.Image;
    IconComponent.displayName = name;

    return cssInterop(IconComponent, {
      className: {
        target: 'style',
        nativeStyleToProp: {
          color: true,
          opacity: true,
          width: true,
          height: true,
        },
      },
    });
  }, [name]);

  return <CustomIcon className={className} size={size} strokeWidth={strokeWidth} {...rest} />;
});

export default Icon;
