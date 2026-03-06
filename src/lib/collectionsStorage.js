export const collectionsStorage = {
    key: 'perry-parcelrunner:collections',

    load() {
        try {
            return JSON.parse(localStorage.getItem(this.key) || 'null');
        } catch {
            return null; // null = no cache; [] = genuinely empty
        }
    },

    save(data) {
        try {
            localStorage.setItem(this.key, JSON.stringify(data));
        } catch {}
    },
};
