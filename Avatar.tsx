import React, { useRef, useEffect } from "react";

// Fix: Declare 'model-viewer' as an intrinsic element to allow its use in JSX
// without TypeScript errors. This is necessary for custom elements.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": any;
    }
  }
}

type AvatarProps = {
  // Fix: Add 'LISTENING' to the state type to accommodate all possible avatar states
  // from the AvatarState enum, resolving the type error in ChatScreen.tsx.
  state: "THINKING" | "SPEAKING" | "IDLE" | "LISTENING";
};

const Avatar: React.FC<AvatarProps> = ({ state }) => {
  const modelViewerRef = useRef<any>(null);

  // State-based glow/shadow classes
  const getStateClasses = () => {
    switch (state) {
      case "THINKING":
        return "shadow-[inset_0_0_60px_15px_rgba(128,0,128,0.5)] animate-pulse";
      case "SPEAKING":
        return "shadow-[inset_0_0_60px_15px_rgba(0,255,255,0.5)]";
      // Fix: Handle the 'LISTENING' state to provide appropriate visual feedback.
      case "LISTENING":
        return "shadow-[inset_0_0_60px_15px_rgba(255,0,0,0.4)]";
      case "IDLE":
      default:
        return "shadow-[inset_0_0_60px_15px_rgba(0,100,255,0.4)]";
    }
  };

  // Debug morph targets once model loads
  useEffect(() => {
    if (!modelViewerRef.current) return;

    modelViewerRef.current.addEventListener("load", () => {
      const scene = modelViewerRef.current?.scene; // This is a THREE.Scene
      console.log("✅ Scene loaded:", scene);

      // Traverse scene to find mesh with morph targets
      scene.traverse((child: any) => {
        if (child.isMesh && child.morphTargetDictionary) {
          console.log("✅ Found morph target mesh:", child);
          console.log("👉 Morph Target Dictionary:", child.morphTargetDictionary);
          console.log("👉 Morph Target Influences:", child.morphTargetInfluences);
        }
      });
    });
  }, []);

  return (
    <div
      className={`w-full h-full pointer-events-none transition-shadow duration-500 ${getStateClasses()}`}
    >
      <model-viewer
        ref={modelViewerRef}
        src="https://models.readyplayer.me/68ca552f7a5250193077d4ef.glb?morphTargets=ARKit,Oculus%20Visemes"
        alt="AURA_Avatar"
        disableZoom
        shadowIntensity="1"
        exposure="1.2"
        cameraOrbit="0deg 75deg 8m"
        autoRotateDelay="0"
        interactionPrompt="none"
        style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
      />
    </div>
  );
};

export default Avatar;
