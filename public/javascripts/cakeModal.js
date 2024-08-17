function openModal(cakeId, cakeName, cakeImage) {
    const modal = document.getElementById('cakeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalImage = document.getElementById('modalImage');
    const sizeSelect = document.getElementById('size');
    const fillingContainer = document.getElementById('filling-container'); // 容器元素
    const fillingSelect = document.getElementById('filling');

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
    if (cakeId === 'mongo_cake') {
        const xlargeOption = sizeSelect.querySelector('option[value="xlarge"]');
        if (xlargeOption) {
            sizeSelect.removeChild(xlargeOption);
        }
    }

    if (cakeId === 'love cake') {
        const xlargeOption = sizeSelect.querySelector('option[value="xlarge"]');
        const smallOption = sizeSelect.querySelector('option[value="small"]');
        if (xlargeOption) {
            sizeSelect.removeChild(xlargeOption);
        }
        if (smallOption) {
            sizeSelect.removeChild(smallOption);
        }
    }

    // 添加或移除夾餡選項
    if (cakeId === 'ice cream cake' || cakeId === 'tiramisu') {
        fillingContainer.style.display = 'none';
    } else {
        fillingContainer.style.display = 'block';
        fillingSelect.innerHTML = `
            <option value="fruit_pudding">水果+布丁</option>
            <option value="taro_pudding">芋頭+布丁</option>
            <option value="blueberry_pudding">藍莓+布丁</option>
        `;
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
        const fillingContainer = document.getElementById('filling-container');
        const filling = fillingContainer.style.display === 'none' ? '' : document.getElementById('filling').value;
        const quantity = document.getElementById('quantity').value;
        cart.addItem(cakeId, cakeName, size, filling, quantity);
        document.getElementById('cakeModal').style.display = 'none';
    });
});
