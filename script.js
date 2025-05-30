let ingredients = [];  // māsivs kurā iet sastāvdaļas

// Spoonacular API Key
const SPOONACULAR_API_KEY = 'dce0c13eb54348b69f124f0bbfd58d82';

// ieliek sastāvdaļu listā
function addIngredient() {
    const input = document.getElementById('ingredient-input');
    const ingredient = input.value.trim().toLowerCase();
    if (ingredient && !ingredients.includes(ingredient)) {
        ingredients.push(ingredient);
        displayIngredients();
    }
    input.value = '';
}

// rāda visas sastāvdaļas kas ir ievadītas
function displayIngredients() {
    const ingredientsList = document.getElementById('ingredients-list');
    ingredientsList.innerHTML = '';
    ingredients.forEach((ingredient, index) => {
        const span = document.createElement('span');
        span.textContent = ingredient;
        span.title = "Click to remove";
        span.style.cursor = "pointer";
        span.onclick = () => removeIngredient(index);
        ingredientsList.appendChild(span);
    });
}

// removo sastāvdaļu
function removeIngredient(index) {
    ingredients.splice(index, 1);
    displayIngredients();
}

// Atrod receptes are ievadītajām sastāvdaļām
async function findRecipes() {
    if (ingredients.length === 0) {
        alert('Please add some ingredients from your fridge!');
        return;
    }

    const query = ingredients.join(',');
    const apiUrl = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&includeIngredients=${query}&number=10&addRecipeInformation=true&fillIngredients=true`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();

        console.log('API Response:', data); // Debugging lietiņa
        displayRecipes(data.results);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        alert('Could not fetch recipes. Please try again.');
    }
}



// ķip debugging
async function fetchRecipesFromAPI() {
    const query = ingredients.join(',');
    const apiUrl = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&includeIngredients=${query}&number=10&addRecipeInformation=true`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        
        const data = await response.json();
        
        console.log('API Response:', data);

        displayRecipes(data.results);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        alert('Could not fetch recipes. Please try again.');
    }
}

//displayo receptes
function displayRecipes(matchingRecipes) {
    const recipesContainer = document.getElementById('recipes');
    recipesContainer.innerHTML = '';
    if (matchingRecipes.length > 0) {
        matchingRecipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.classList.add('recipe-card');

            // sastāvdaļas kas tev ir un kas tev pietrūkst
            const usedIngredients = recipe.usedIngredients?.map(i => i.name).join(', ') || 'None';
            const missedIngredients = recipe.missedIngredients?.map(i => i.name).join(', ') || 'None';

            // Vegan/Vegetarian teksts
            let labels = '';

            if (recipe.vegan) {
                labels += '<span class="label vegan"><i class="fas fa-leaf"></i> Vegan</span>';
            }

            if (recipe.vegetarian) {
                labels += '<span class="label vegetarian"><i class="fas fa-carrot"></i> Vegetarian</span>';
            }


            // Recipe card
            recipeCard.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}">
                <h3>${recipe.title}</h3>
                ${labels ? `<p>${labels}</p>` : ''}
                <p style="color: #2f302f;"><strong>Ingredients You Have:</strong> ${usedIngredients}</p>
                <p style="color: #787a79;"><strong>Ingredients You Need:</strong> ${missedIngredients}</p>
            `;

            recipeCard.onclick = () => showRecipeDetails(recipe);
            recipesContainer.appendChild(recipeCard);
        });
    } else {
        recipesContainer.innerHTML = '<p>No recipes found. Try adding more ingredients!</p>';
    }
}


// modal kur rāda receptes details
async function showRecipeDetails(recipe) {
    const apiUrl = `https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${SPOONACULAR_API_KEY}`;
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch recipe details.');

        const detailedRecipe = await response.json();

        const sanitizeHTML = (html) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            return doc.body.textContent || 'No instructions available.';
        };

        const instructions = sanitizeHTML(detailedRecipe.instructions);
        const usedIngredients = recipe.usedIngredients?.map(i => i.name).join(', ') || 'None';
        const missedIngredients = recipe.missedIngredients?.map(i => i.name).join(', ') || 'None';


        document.getElementById('modal-title').textContent = detailedRecipe.title;
        document.getElementById('modal-image').src = detailedRecipe.image;
        document.getElementById('modal-description').textContent = instructions; 

        document.getElementById('modal-ingredients-having').textContent = `${usedIngredients}`;
        document.getElementById('modal-ingredients-needing').textContent = `${missedIngredients}`;
        
        const modal = document.getElementById('recipe-modal');
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching detailed recipe:', error);
        alert('Failed to load recipe details.');
    }
}



document.getElementById('close-modal').onclick = function () {
    document.getElementById('recipe-modal').style.display = 'none';
};

window.onclick = function (event) {
    const modal = document.getElementById('recipe-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.querySelector(".modal");
    const modalOverlay = document.querySelector(".modal-overlay");
    const closeModalButton = document.querySelector(".close");

    if (!sessionStorage.getItem("modalShown")) {
        modal.style.display = "block";
        modalOverlay.style.display = "block";

        sessionStorage.setItem("modalShown", "true");
    }

    closeModalButton.addEventListener("click", () => {
        modal.style.display = "none";
        modalOverlay.style.display = "none";
    });

    modalOverlay.addEventListener("click", () => {
        modal.style.display = "none";
        modalOverlay.style.display = "none";
    });
});
