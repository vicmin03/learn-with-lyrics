import { customPinyin } from 'pinyin-pro';

export const addCustomPinyin = () => {
    customPinyin({
        了: 'le',
        妳: 'nǐ'
    })
}
