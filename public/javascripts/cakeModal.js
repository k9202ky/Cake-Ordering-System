function openModal(cakeId, cakeName, cakeImage) {
    const modal = document.getElementById('cakeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalImage = document.getElementById('modalImage');
    const sizeSelect = document.getElementById('size');

    modal.style.display = 'block';
    modalTitle.textContent = cakeName;
    modalTitle.dataset.cakeId = cakeId;
    modalImage.src = cakeImage;

    // 清空尺寸選項
    sizeSelect.innerHTML = `
        <option value="small">6吋</option>
        <option value="medium">8吋</option>
        <option value="large">10吋</option>
        <option value="xlarge">12吋</option>
    `;

    // 移除沒有12吋的蛋糕的選項
    if (cakeId === 'tiramisu') {
        const xlargeOption = sizeSelect.querySelector('option[value="xlarge"]');
        if (xlargeOption) {
            sizeSelect.removeChild(xlargeOption);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const modalClose = document.querySelector('.close');
    modalClose.addEventListener('click', () => {
        const modal = document.getElementById('cakeModal');
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        const modal = document.getElementById('cakeModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    const orderForm = document.getElementById('cakeOrderForm');
    orderForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const cakeId = document.getElementById('modalTitle').dataset.cakeId;
        const cakeName = document.getElementById('modalTitle').textContent;
        const size = document.getElementById('size').value;
        const quantity = document.getElementById('quantity').value;
        const price = getCakePrice(cakeId, size);
        cart.addItem(cakeId, cakeName, size, quantity, price);
        document.getElementById('cakeModal').style.display = 'none';
    });
});

function getCakePrice(cakeId, size) {
    const priceList = {
        'tiramisu': {
            'small': 500,
            'medium': 750,
            'large': 1000
        },
        'ice cream cake': {
            'small': 500,
            'medium': 750,
            'large': 1000,
            'xlarge': 1350
        },
        'cream cake': {
            'small': 500,
            'medium': 750,
            'large': 1000,
            'xlarge': 1350
        },
        'chocolate cake': {
            'small': 500,
            'medium': 750,
            'large': 1000,
            'xlarge': 1350
        }
    };

    return priceList[cakeId][size];
}
