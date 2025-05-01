// Banco de dados completo de alimentos
const cardapio = {
    "segunda": {
        "Leite": { porcao: 200, unidade: "ml" },
        "Fruta": { 
            porcao: 1, 
            unidade: "unidade",
            tipos: {
                "padrao": ["Maçã", "Banana", "Pêra"],
                "especial": ["Mamão", "Melancia"]
            }
        }
    },
    "terca": {
        "Suco de laranja": { porcao: 200, unidade: "ml" },
        "Biscoito": { 
            porcao: 2, 
            unidade: "unidades",
            tipos: {
                "doce": ["Biscoito Maizena", "Biscoito Recheado"],
                "salgado": ["Cream Cracker", "Biscoito Água e Sal"]
            }
        }
    },
    // ... outros dias ...
};

const nutrientes = {
    "Suco de laranja": { calorias: 90, vitaminaC: "120%" },
    "Biscoito": { calorias: 80, carboidratos: "15g" }
    // ... outros ...
};

let diaSelecionado = "terca";
let tipoBiscoito = "doce";
let tipoFruta = "padrao";

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarSelecoes();
    
    document.querySelectorAll('.dia').forEach(dia => {
        dia.addEventListener('click', function() {
            diaSelecionado = this.getAttribute('data-dia');
            atualizarOpcoesRefeicao();
            salvarSelecoes();
        });
    });

    document.getElementById('tipo-biscoito').addEventListener('change', function() {
        tipoBiscoito = this.value;
        salvarSelecoes();
    });

    document.getElementById('calcular').addEventListener('click', calcularQuantidades);
    
    atualizarOpcoesRefeicao();
});

// Funções auxiliares
function atualizarOpcoesRefeicao() {
    const container = document.getElementById('opcoes-refeicao');
    container.innerHTML = '<h3>Itens do Cardápio:</h3>';
    
    // Esconde seletores
    document.getElementById('tipo-biscoito-container').style.display = 'none';
    document.getElementById('tipo-fruta-container').style.display = 'none';
    
    Object.keys(cardapio[diaSelecionado]).forEach(item => {
        const opcao = document.createElement('div');
        opcao.className = 'opcao';
        opcao.textContent = item;
        
        opcao.addEventListener('click', function() {
            this.classList.toggle('selecionada');
            
            if (item === "Biscoito") {
                document.getElementById('tipo-biscoito-container').style.display = 
                    this.classList.contains('selecionada') ? 'block' : 'none';
            }
            
            if (item === "Fruta") {
                document.getElementById('tipo-fruta-container').style.display = 
                    this.classList.contains('selecionada') ? 'block' : 'none';
            }
            
            salvarSelecoes();
        });
        
        container.appendChild(opcao);
    });
}

function calcularQuantidades() {
    const qtd = parseInt(document.getElementById('quantidade').value) || 0;
    const resultado = document.getElementById('resultado');
    
    if (qtd < 1) {
        resultado.innerHTML = '<p class="erro">Digite um número válido</p>';
        return;
    }

    const selecionados = document.querySelectorAll('.opcao.selecionada');
    if (selecionados.length === 0) {
        resultado.innerHTML = '<p class="erro">Selecione pelo menos um item</p>';
        return;
    }

    let html = '<h3>Quantidades:</h3><div class="resultados-container">';
    
    selecionados.forEach(opcao => {
        const item = opcao.textContent;
        const dados = cardapio[diaSelecionado][item];
        const infoNutri = nutrientes[item] || {};
        
        if (item === "Biscoito") {
            html += `
                <div class="alimento">
                    <strong>Biscoito (${tipoBiscoito}):</strong> 
                    ${dados.porcao * qtd} ${dados.unidade}
                    <div class="opcoes">Opções: ${dados.tipos[tipoBiscoito].join(', ')}</div>
                    ${exibirNutrientes(infoNutri)}
                </div>
            `;
        } else if (item === "Fruta") {
            html += `
                <div class="alimento">
                    <strong>Fruta (${tipoFruta}):</strong> 
                    ${dados.porcao * qtd} ${dados.unidade}
                    <div class="opcoes">Opções: ${dados.tipos[tipoFruta].join(', ')}</div>
                    ${exibirNutrientes(infoNutri)}
                </div>
            `;
        } else {
            html += `
                <div class="alimento">
                    <strong>${item}:</strong> ${dados.porcao * qtd} ${dados.unidade}
                    ${exibirNutrientes(infoNutri)}
                </div>
            `;
        }
    });
    
    html += '</div><button id="exportar">Exportar Cardápio</button>';
    resultado.innerHTML = html;
    
    document.getElementById('exportar').addEventListener('click', exportarCardapio);
}

function exibirNutrientes(nutri) {
    if (!nutri || Object.keys(nutri).length === 0) return '';
    
    let html = '<div class="nutrientes"><small>';
    for (const [key, value] of Object.entries(nutri)) {
        html += `${key}: ${value} | `;
    }
    return html.slice(0, -3) + '</small></div>';
}

function salvarSelecoes() {
    const selecoes = {
        dia: diaSelecionado,
        tipoBiscoito: tipoBiscoito,
        tipoFruta: tipoFruta,
        itens: Array.from(document.querySelectorAll('.opcao.selecionada')).map(el => el.textContent),
        quantidade: document.getElementById('quantidade').value
    };
    localStorage.setItem('nutrikids_selecoes', JSON.stringify(selecoes));
}

function carregarSelecoes() {
    const salvo = localStorage.getItem('nutrikids_selecoes');
    if (salvo) {
        const {dia, tipoBiscoito, tipoFruta, itens, quantidade} = JSON.parse(salvo);
        diaSelecionado = dia;
        document.getElementById('tipo-biscoito').value = tipoBiscoito;
        document.getElementById('tipo-fruta').value = tipoFruta;
        document.getElementById('quantidade').value = quantidade || '';
        
        // Restaurar seleções após atualizar opções
        setTimeout(() => {
            document.querySelectorAll('.opcao').forEach(opcao => {
                if (itens.includes(opcao.textContent)) {
                    opcao.classList.add('selecionada');
                    
                    // Mostrar seletores se necessário
                    if (opcao.textContent === "Biscoito") {
                        document.getElementById('tipo-biscoito-container').style.display = 'block';
                    }
                    if (opcao.textContent === "Fruta") {
                        document.getElementById('tipo-fruta-container').style.display = 'block';
                    }
                }
            });
        }, 0);
    }
}

function exportarCardapio() {
    // Implementar lógica de exportação
    alert("Funcionalidade de exportação será implementada aqui!");
}