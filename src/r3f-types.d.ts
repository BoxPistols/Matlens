// React 18 + @react-three/fiber: ThreeElements を React.JSX.IntrinsicElements に注入
// see https://docs.pmnd.rs/react-three-fiber/getting-started/typescript
import type { ThreeElements } from '@react-three/fiber'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
