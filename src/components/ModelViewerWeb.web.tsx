import { Asset } from 'expo-asset';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

const MODEL_VIEWER_SCRIPT = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';

function loadModelViewerScript(): Promise<void> {
  if (typeof document === 'undefined') {
    return Promise.resolve();
  }
  if (customElements.get('model-viewer')) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${MODEL_VIEWER_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = MODEL_VIEWER_SCRIPT;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('model-viewer script laden mislukt'));
    document.head.appendChild(script);
  });
}

function getDomNode(ref: View | null): HTMLElement | null {
  if (!ref) {
    return null;
  }
  const node = ref as unknown as HTMLElement;
  return typeof node.appendChild === 'function' ? node : null;
}

type ModelViewerWebProps = {
  modelModule?: number;
};

export default function ModelViewerWeb({ modelModule }: ModelViewerWebProps) {
  const hostRef = useRef<View | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const mod = modelModule ?? require('../../assets/3d-models/Tasko.glb');
    const asset = Asset.fromModule(mod);

    asset.downloadAsync().then(() => {
      if (!cancelled && asset.uri) {
        setSrc(asset.uri);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [modelModule]);

  useEffect(() => {
    if (!src) {
      return;
    }

    let viewer: HTMLElement | null = null;
    let hostNode: HTMLElement | null = null;

    const mount = async () => {
      try {
        await loadModelViewerScript();
        hostNode = getDomNode(hostRef.current);
        if (!hostNode) {
          return;
        }

        hostNode.innerHTML = '';
        viewer = document.createElement('model-viewer');
        viewer.setAttribute('src', src);
        viewer.setAttribute('alt', 'Tasko monster');
        viewer.setAttribute('ar', '');
        viewer.setAttribute('ar-modes', 'webxr scene-viewer');
        viewer.setAttribute('camera-controls', '');
        viewer.setAttribute('touch-action', 'pan-y');
        viewer.setAttribute('shadow-intensity', '1');
        viewer.setAttribute('exposure', '1');
        Object.assign(viewer.style, {
          width: '100%',
          height: '100%',
          minHeight: '360px',
          backgroundColor: '#0b0f14',
        });
        hostNode.appendChild(viewer);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'AR-viewer laden mislukt');
      }
    };

    const timer = setTimeout(() => {
      void mount();
    }, 0);

    return () => {
      clearTimeout(timer);
      viewer?.remove();
      if (hostNode) {
        hostNode.innerHTML = '';
      }
    };
  }, [src]);

  if (error) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!src) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6ee7b7" />
      </View>
    );
  }

  return <View ref={hostRef} style={styles.wrap} collapsable={false} />;
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: '100%',
    minHeight: 360,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
    padding: 16,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
  },
});
