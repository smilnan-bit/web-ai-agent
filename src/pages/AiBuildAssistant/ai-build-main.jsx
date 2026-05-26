import React from 'react';
import { createRoot } from 'react-dom/client';
import AiBuildApp from './AiBuildApp';

const container = document.getElementById('ai-build-root');
const root = createRoot(container);
root.render(<AiBuildApp />);
