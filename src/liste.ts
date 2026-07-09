interface CartItem {
  nom: string;
  quantite: number;
  prix_unitaire: number;
}

export function obtenirPanier(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem('listeCourses') ?? '[]');
  } catch {
    return [];
  }
}

export function sauvegarderPanier(cart: CartItem[]): void {
  localStorage.setItem('listeCourses', JSON.stringify(cart));
}

export function calculerTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantite * item.prix_unitaire, 0);
}

export function modifierQuantite(cart: CartItem[], index: number, quantite: number): CartItem[] {
  const qty = Number.isFinite(quantite) ? Math.max(1, Math.floor(quantite)) : 1;
  return cart.map((item, i) => i === index ? { ...item, quantite: qty } : item);
}

export function supprimerProduit(cart: CartItem[], index: number): CartItem[] {
  return cart.filter((_, i) => i !== index);
}

function renderCartRow(item: CartItem, index: number): string {
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

function renderCartRows(cart: CartItem[]): string {
  if (cart.length === 0) {
    return '<tr class="empty-cart"><td colspan="5">Votre liste de course est vide.</td></tr>';
  }
  return cart.map((item, index) => renderCartRow(item, index)).join('');
}

export function afficherTableau(cart: CartItem[]): void {
  const body = document.getElementById('liste-course-body') as HTMLTableSectionElement;
  body.innerHTML = renderCartRows(cart);
}

export function afficherTotal(cart: CartItem[]): void {
  const totalEl = document.getElementById('total-general') as HTMLElement;
  totalEl.textContent = `${calculerTotal(cart).toFixed(2)} €`;
}

export function viderListe(): void {
  sauvegarderPanier([]);
}

function init(): void {
  const body = document.getElementById('liste-course-body') as HTMLTableSectionElement;
  const viderBtn = document.getElementById('vider-liste') as HTMLButtonElement;

  function render(): void {
    const cart = obtenirPanier();
    afficherTableau(cart);
    afficherTotal(cart);
  }

  body.addEventListener('change', (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.tagName !== 'INPUT') return;
    const index = parseInt(input.dataset.index!, 10);
    sauvegarderPanier(modifierQuantite(obtenirPanier(), index, parseInt(input.value, 10)));
    render();
  });

  body.addEventListener('click', (e: Event) => {
    const btn = (e.target as HTMLElement).closest('button');
    if (!btn || !('delete' in btn.dataset)) return;
    const index = parseInt(btn.dataset.index!, 10);
    sauvegarderPanier(supprimerProduit(obtenirPanier(), index));
    render();
  });

  viderBtn.addEventListener('click', () => {
    if (obtenirPanier().length === 0) return;
    if (!confirm('Voulez-vous vraiment vider votre liste de course ?')) return;
    viderListe();
    render();
  });

  render();
}

init();