import { useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  PinchGestureHandler,
  PinchGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';
import { colors } from '../utils/colors';

interface ZoomableImageProps {
  source: ImageSourcePropType;
  accessibilityLabel?: string;
}

function getAspectRatio(source: ImageSourcePropType): number {
  const resolved = Image.resolveAssetSource(source);
  return resolved && resolved.height > 0 ? resolved.width / resolved.height : 1;
}

export function ZoomableImage({ source, accessibilityLabel }: ZoomableImageProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const aspectRatio = getAspectRatio(source);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => setIsFullscreen(true)}>
        <Image
          source={source}
          resizeMode="contain"
          style={[styles.thumbnail, { aspectRatio }]}
          accessibilityLabel={accessibilityLabel}
        />
      </TouchableOpacity>
      <Text style={styles.caption}>Tap to zoom</Text>

      <Modal
        visible={isFullscreen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFullscreen(false)}
      >
        {isFullscreen && (
          <FullscreenViewer
            source={source}
            aspectRatio={aspectRatio}
            onClose={() => setIsFullscreen(false)}
          />
        )}
      </Modal>
    </View>
  );
}

interface FullscreenViewerProps {
  source: ImageSourcePropType;
  aspectRatio: number;
  onClose: () => void;
}

function FullscreenViewer({ source, aspectRatio, onClose }: FullscreenViewerProps) {
  const { width } = useWindowDimensions();
  const pinchRef = useRef(null);
  const panRef = useRef(null);

  // Scale is accumulated across gestures: baseScale holds the committed value,
  // pinchScale holds the in-progress gesture, and the two are multiplied.
  const baseScale = useRef(new Animated.Value(1)).current;
  const pinchScale = useRef(new Animated.Value(1)).current;
  const scale = Animated.multiply(baseScale, pinchScale);
  const lastScale = useRef(1);

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef({ x: 0, y: 0 }).current;

  const onPinchEvent = Animated.event([{ nativeEvent: { scale: pinchScale } }], {
    useNativeDriver: true,
  });

  const onPinchStateChange = (event: PinchGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastScale.current = Math.max(1, lastScale.current * event.nativeEvent.scale);
      baseScale.setValue(lastScale.current);
      pinchScale.setValue(1);
    }
  };

  const onPanEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true },
  );

  const onPanStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastOffset.x += event.nativeEvent.translationX;
      lastOffset.y += event.nativeEvent.translationY;
      translateX.setOffset(lastOffset.x);
      translateX.setValue(0);
      translateY.setOffset(lastOffset.y);
      translateY.setValue(0);
    }
  };

  return (
    <GestureHandlerRootView style={styles.fullscreenRoot}>
      <PanGestureHandler
        ref={panRef}
        simultaneousHandlers={pinchRef}
        onGestureEvent={onPanEvent}
        onHandlerStateChange={onPanStateChange}
      >
        <Animated.View style={styles.fullscreenContent}>
          <PinchGestureHandler
            ref={pinchRef}
            simultaneousHandlers={panRef}
            onGestureEvent={onPinchEvent}
            onHandlerStateChange={onPinchStateChange}
          >
            <Animated.View style={styles.fullscreenContent}>
              <Animated.Image
                source={source}
                resizeMode="contain"
                style={{
                  width,
                  height: width / aspectRatio,
                  transform: [{ scale }, { translateX }, { translateY }],
                }}
              />
            </Animated.View>
          </PinchGestureHandler>
        </Animated.View>
      </PanGestureHandler>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },
  thumbnail: {
    width: '100%',
    borderRadius: 6,
    backgroundColor: colors.surfaceElevated,
  },
  caption: {
    marginTop: 4,
    fontSize: 12,
    color: colors.onSurfaceMuted,
    textAlign: 'center',
  },
  fullscreenRoot: {
    flex: 1,
    backgroundColor: colors.revealOverlay,
  },
  fullscreenContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 44,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  closeText: {
    fontSize: 20,
    color: colors.onSurface,
    lineHeight: 24,
  },
});
