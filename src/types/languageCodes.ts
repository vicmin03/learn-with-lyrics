// Define the supported languages and scripts 

export const languageCodes: Record<string, string> = {
    'Chinese': 'zh',
    'English': 'en',
    'Japanese': 'ja',
    'Korean': 'ko',
};

export const scripts: Record<'cn' | 'tw' | 'hk', string> = {
    'cn': 'Simplified',
    'tw': 'Traditional (Taiwan)',
    'hk': 'Traditional (Hong Kong)'
}