// index.tsx
import { createRoot } from 'react-dom/client';
import App from '@src/app';
// index.tsx
// eslint-disable-next-line
// @ts-ignore
import tailwindcssOutput from '@src/tailwind-output.css?inline';

// const asideElement: HTMLElement | null = document.querySelector('[class^="style_aside__"]');

const root = document.createElement('div');
root.id = 'chrome-extension-boilerplate-react-vite-content-view-root';

// if (!asideElement) {
//   throw new Error('Could not find aside element');  
// }

// document.append(root);
// asideElement?.appendChild(root);
document.body.appendChild(root);

const rootIntoShadow = document.createElement('div');
rootIntoShadow.id = 'shadow-root';

const shadowRoot = root.attachShadow({ mode: 'open' });
shadowRoot.appendChild(rootIntoShadow);

/** Inject styles into shadow dom */
const styleElement = document.createElement('style');
styleElement.innerHTML = tailwindcssOutput;
shadowRoot.appendChild(styleElement);


createRoot(rootIntoShadow).render(<App/>);
