import { render } from '@testing-library/react';

function Providers({ children }) {
    return children;
}

export * from '@testing-library/react';

export function customRender(ui, options) {
    return render(ui, { wrapper: Providers, ...options });
}