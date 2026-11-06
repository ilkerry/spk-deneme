import { View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import type { Card } from '@/data/content';
import type { StudyMode } from '@/store/settings';

import { SwipeCard, type SwipeCardHandle, type SwipeDirection } from './SwipeCard';

type SwipeDeckProps = {
  cards: Card[];
  /** Şu anki kartın sırası */
  index: number;
  mode: StudyMode;
  width: number;
  onSwiped: (card: Card, dir: SwipeDirection) => void;
  /** Geri alınan kartın geleceği yön */
  enterFrom?: SwipeDirection;
  deckRef?: React.Ref<SwipeCardHandle | null>;
};

const VISIBLE = 3;

/** Üst üste duran 3 kartlık deste. Üstteki kart sürüklenir, arkadakiler öne yaklaşır. */
export function SwipeDeck({ cards, index, mode, width, onSwiped, enterFrom, deckRef }: SwipeDeckProps) {
  const dragProgress = useSharedValue(0);
  const visible = cards.slice(index, index + VISIBLE);

  return (
    <View style={{ flex: 1 }}>
      {visible
        .map((card, i) => (
          <SwipeCard
            key={card.id}
            ref={i === 0 ? deckRef : undefined}
            card={card}
            depth={i}
            position={index + i + 1}
            total={cards.length}
            mode={mode}
            width={width}
            dragProgress={dragProgress}
            enterFrom={i === 0 ? enterFrom : undefined}
            onSwiped={(dir) => onSwiped(card, dir)}
          />
        ))
        .reverse()}
    </View>
  );
}
