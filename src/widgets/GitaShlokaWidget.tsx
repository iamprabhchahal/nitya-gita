import { HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  containerBackground,
  font,
  foregroundStyle,
  lineLimit,
  multilineTextAlignment,
  padding,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';
import React from 'react';

import type { GitaWidgetProps } from '../types/app';

export const DEFAULT_WIDGET_PROPS: GitaWidgetProps = {
  verseId: '2.47',
  chapter: 2,
  verse: 47,
  reference: 'BG 2.47',
  chapterName: 'Sankhya Yoga',
  lockLine:
    'Your right is to work only, never to its fruits; let not reward be your motive.',
  inlineText: 'Work without attachment to fruits',
  homePrimary: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन',
  homeSecondary:
    'Your right is to work only, never to its fruits; let not reward be your motive.',
  deepLinkUrl: 'nityagita://verse/2/47',
  isPinned: false,
};

function GitaShlokaWidgetLayout(
  props: GitaWidgetProps,
  environment: WidgetEnvironment
) {
  'widget';

  const safeProps = {
    ...DEFAULT_WIDGET_PROPS,
    ...(props ?? {}),
  };

  const family = environment.widgetFamily ?? 'systemSmall';
  const isDark = environment.colorScheme === 'dark';

  if (family === 'accessoryInline') {
    return (
      <Text
        modifiers={[
          lineLimit(1),
          widgetURL(safeProps.deepLinkUrl),
        ]}
      >
        {`${safeProps.reference} · ${safeProps.inlineText}`}
      </Text>
    );
  }

  if (family === 'accessoryRectangular') {
    return (
      <VStack
        alignment="leading"
        spacing={2}
        modifiers={[
          widgetURL(safeProps.deepLinkUrl),
          containerBackground({ type: 'color', color: 'clear' }, 'widget'),
        ]}
      >
        <HStack spacing={4}>
          <Text
            modifiers={[
              font({ size: 11, weight: 'bold', design: 'rounded' }),
              foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
            ]}
          >
            {safeProps.isPinned ? `${safeProps.reference} · PINNED` : safeProps.reference}
          </Text>
          <Spacer />
        </HStack>
        <Text
          modifiers={[
            font({ size: 13, weight: 'medium' }),
            lineLimit(3),
            multilineTextAlignment('leading'),
            foregroundStyle({ type: 'hierarchical', style: 'primary' }),
          ]}
        >
          {safeProps.lockLine}
        </Text>
      </VStack>
    );
  }

  const bgGradient = isDark
    ? ['#090E22', '#1A1C3C']
    : ['#FFF8ED', '#F5D6AC'];
  const accentColor = isDark ? '#F2B45A' : '#B8520F';
  const primaryInk = isDark ? '#F8F4EC' : '#1E160F';
  const secondaryInk = isDark ? '#CFC7BB' : '#584637';

  if (family === 'systemSmall') {
    return (
      <VStack
        alignment="leading"
        spacing={6}
        modifiers={[
          padding({ all: 12 }),
          widgetURL(safeProps.deepLinkUrl),
          containerBackground(
            {
              type: 'linearGradient',
              colors: bgGradient,
              startPoint: { x: 0, y: 0 },
              endPoint: { x: 1, y: 1 },
            },
            'widget'
          ),
        ]}
      >
        <HStack>
          <Text
            modifiers={[
              font({ size: 11, weight: 'bold', design: 'rounded' }),
              foregroundStyle(accentColor),
            ]}
          >
            {safeProps.reference}
          </Text>
          <Spacer />
        </HStack>
        <Text
          modifiers={[
            font({ size: 13, weight: 'medium', design: 'serif' }),
            foregroundStyle(primaryInk),
            lineLimit(4),
            multilineTextAlignment('leading'),
          ]}
        >
          {safeProps.homePrimary}
        </Text>
        <Spacer />
        <Text
          modifiers={[
            font({ size: 10, weight: 'medium' }),
            foregroundStyle(secondaryInk),
            lineLimit(1),
          ]}
        >
          {safeProps.chapterName}
        </Text>
      </VStack>
    );
  }

  // systemMedium (and fallback)
  return (
    <VStack
      alignment="leading"
      spacing={6}
      modifiers={[
        padding({ all: 14 }),
        widgetURL(safeProps.deepLinkUrl),
        containerBackground(
          {
            type: 'linearGradient',
            colors: bgGradient,
            startPoint: { x: 0, y: 0 },
            endPoint: { x: 1, y: 1 },
          },
          'widget'
        ),
      ]}
    >
      <HStack>
        <Text
          modifiers={[
            font({ size: 11, weight: 'bold', design: 'rounded' }),
            foregroundStyle(accentColor),
          ]}
        >
          {`BHAGAVAD GITA ${safeProps.verseId}`}
        </Text>
        <Spacer />
        <Text
          modifiers={[
            font({ size: 11, weight: 'medium' }),
            foregroundStyle(secondaryInk),
            lineLimit(1),
          ]}
        >
          {safeProps.chapterName}
        </Text>
      </HStack>
      <Text
        modifiers={[
          font({ size: 14, weight: 'semibold', design: 'serif' }),
          foregroundStyle(primaryInk),
          lineLimit(2),
          multilineTextAlignment('leading'),
        ]}
      >
        {safeProps.homePrimary}
      </Text>
      <Text
        modifiers={[
          font({ size: 12, weight: 'regular' }),
          foregroundStyle(secondaryInk),
          lineLimit(2),
          multilineTextAlignment('leading'),
        ]}
      >
        {safeProps.homeSecondary}
      </Text>
      <Spacer />
    </VStack>
  );
}

const NityaGitaWidget = createWidget<GitaWidgetProps>(
  'NityaGitaWidget',
  GitaShlokaWidgetLayout,
  DEFAULT_WIDGET_PROPS
);

export default NityaGitaWidget;
