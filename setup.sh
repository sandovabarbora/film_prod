#!/bin/bash

# Vytvoření React app s TypeScript
npx create-react-app frontend --template typescript
cd frontend

# Instalace závislostí
npm install axios react-router-dom@6 react-query @tanstack/react-query
npm install styled-components framer-motion react-intersection-observer
npm install react-hook-form yup @hookform/resolvers
npm install date-fns react-dropzone

# Dev dependencies
npm install -D @types/styled-components @types/react-router-dom
npm install -D prettier eslint-config-prettier

# Cleanup
rm -rf src/App.css src/App.test.tsx src/logo.svg src/reportWebVitals.ts src/setupTests.ts

echo "Setup complete!"
