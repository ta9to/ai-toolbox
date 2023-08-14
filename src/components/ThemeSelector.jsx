import React from 'react';
import { RadioGroup, Radio } from '@nextui-org/react';
import themeSettings from '../../config/theme.js';

export default function ThemeSelector({ theme, setTheme }) {
    const themeOptions = Object.keys(themeSettings.themes); // テーマのキーを取得

    return (
        <RadioGroup
            orientation="horizontal"
            defaultValue={theme}
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
        >
            {themeOptions.map((themeName) => (
                <Radio key={themeName} value={themeName}>
                    {themeName.charAt(0).toUpperCase() + themeName.slice(1)} {/* テーマ名の最初の文字を大文字に */}
                </Radio>
            ))}
        </RadioGroup>
    );
}
