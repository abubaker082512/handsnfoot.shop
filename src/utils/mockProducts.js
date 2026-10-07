import initialProducts from './initialProducts.json';

export let mockProducts = initialProducts;

if (typeof window !== 'undefined') {
    fetch('/products.json')
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                mockProducts = data;
            }
        })
        .catch(err => console.error('Catalog fetch error:', err));
}

export const getMockProduct = (id) => {
    return mockProducts.find(p => p.id === id) || mockProducts[0];
};

export const getMockRelatedProducts = (category, excludeId) => {
    return mockProducts.filter(p => p.category === category && p.id !== excludeId).slice(0, 4);
};
