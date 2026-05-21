interface CartItem {
  nom: string;
  quantite: number;
  prix_unitaire: number;
}

export function getCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem('listeCourses') ?? '[]');
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  localStorage.setItem('listeCourses', JSON.stringify(cart));
}

export function calculateTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantite * item.prix_unitaire, 0);
}

export function updateQuantity(cart: CartItem[], index: number, quantite: number): CartItem[] {
  const qty = Number.isFinite(quantite) ? Math.max(1, Math.floor(quantite)) : 1;
  return cart.map((item, i) => i === index ? { ...item, quantite: qty } : item);
}

export function removeItem(cart: CartItem[], index: number): CartItem[] {
  return cart.filter((_, i) => i !== index);
}

export function renderCartRow(item: CartItem, index: number): string {
  const sousTotal = item.quantite * item.prix_unitaire;
  return `
    <tr>
      <td>${item.nom}</td>
      <td>${item.prix_unitaire.toFixed(2)} €</td>
      <td><input type="number" min="1" value="${item.quantite}" data-index="${index}" /></td>
      <td>${sousTotal.toFixed(2)} €</td>
      <td><button class="btn-supprimer" data-delete data-index="${index}">Supprimer</button></td>
    </tr>
  `;
}

export function renderCart(cart: CartItem[]): string {
  if (cart.length === 0) {
    return '<tr class="empty-cart"><td colspan="5">Votre liste de course est vide.</td></tr>';
  }
  return cart.map((item, index) => renderCartRow(item, index)).join('');
}

function init(): void {
  const body = document.getElementById('liste-course-body') as HTMLTableSectionElement;
  const totalEl = document.getElementById('total-general') as HTMLElement;
  const viderBtn = document.getElementById('vider-liste') as HTMLButtonElement;

  function render(): void {
    const cart = getCart();
    body.innerHTML = renderCart(cart);
    totalEl.textContent = `${calculateTotal(cart).toFixed(2)} €`;
  }

  body.addEventListener('change', (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.tagName !== 'INPUT') return;
    const index = parseInt(input.dataset.index!, 10);
    saveCart(updateQuantity(getCart(), index, parseInt(input.value, 10)));
    render();
  });

  body.addEventListener('click', (e: Event) => {
    const btn = (e.target as HTMLElement).closest('button');
    if (!btn || !('delete' in btn.dataset)) return;
    const index = parseInt(btn.dataset.index!, 10);
    saveCart(removeItem(getCart(), index));
    render();
  });

  viderBtn.addEventListener('click', () => {
    if (getCart().length === 0) return;
    if (!confirm('Voulez-vous vraiment vider votre liste de course ?')) return;
    saveCart([]);
    render();
  });

  render();
}

init();