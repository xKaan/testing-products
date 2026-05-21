interface Product {
  nom: string;
  quantite_stock: number;
  prix_unitaire: number;
}

interface CartItem {
  nom: string;
  quantite: number;
  prix_unitaire: number;
}

type Critere = 'nom' | 'prix';

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

export function addToCart(cart: CartItem[], product: { nom: string; prix_unitaire: number }): CartItem[] {
  const existing = cart.find(item => item.nom === product.nom);
  if (existing) {
    return cart.map(item =>
      item.nom === product.nom
        ? { ...item, quantite: item.quantite + 1 }
        : item
    );
  }
  return [...cart, { nom: product.nom, quantite: 1, prix_unitaire: product.prix_unitaire }];
}

export function filterProducts(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter(p => p.nom.toLowerCase().includes(q));
}

export function sortProducts(products: Product[], critere: Critere): Product[] {
  const sorted = [...products];
  if (critere === 'prix') {
    sorted.sort((a, b) => a.prix_unitaire - b.prix_unitaire);
  } else {
    sorted.sort((a, b) => a.nom.localeCompare(b.nom));
  }
  return sorted;
}

export function renderProductCard(product: Product): string {
  return `
    <li class="card">
      <h2 class="card-title">${product.nom}</h2>
      <p>Quantité en stock : <strong>${product.quantite_stock}</strong></p>
      <p>Prix unitaire : <strong>${product.prix_unitaire.toFixed(2)} €</strong></p>
      <button class="btn-ajouter" data-nom="${product.nom}" data-prix="${product.prix_unitaire}">Ajouter à la liste</button>
    </li>
  `;
}

export function renderProducts(products: Product[]): string {
  if (products.length === 0) {
    return '<li class="empty">Aucun produit trouvé.</li>';
  }
  return products.map(renderProductCard).join('');
}

async function init(): Promise<void> {
  const response = await fetch('/liste_produits_quotidien.json');
  const products: Product[] = await response.json();

  const recherche = document.getElementById('recherche') as HTMLInputElement;
  const tri = document.getElementById('tri') as HTMLSelectElement;
  const resetBtn = document.getElementById('reset-filtres') as HTMLButtonElement;
  const liste = document.getElementById('liste-produits') as HTMLUListElement;
  const compteur = document.getElementById('compteur-produits') as HTMLElement;

  function update(): void {
    const resultats = sortProducts(filterProducts(products, recherche.value), tri.value as Critere);
    liste.innerHTML = renderProducts(resultats);
    compteur.textContent = `${resultats.length} produits`;
  }

  recherche.addEventListener('input', update);
  tri.addEventListener('change', update);
  resetBtn.addEventListener('click', () => {
    recherche.value = '';
    tri.value = 'nom';
    update();
  });

  liste.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('btn-ajouter')) return;
    const btn = target as HTMLButtonElement;
    const nom = btn.dataset.nom!;
    const prix = parseFloat(btn.dataset.prix!);
    saveCart(addToCart(getCart(), { nom, prix_unitaire: prix }));
    btn.textContent = 'Ajouté ✓';
    setTimeout(() => { btn.textContent = 'Ajouter à la liste'; }, 1000);
  });

  update();
}

init();