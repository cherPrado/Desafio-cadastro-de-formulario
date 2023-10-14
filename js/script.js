$(document).ready(function() {

    $("#fecharModal, .modal").click(function() {
        $("#meuModal").hide();
    });

    $("#form").submit(function (event){
        event.preventDefault()
        event.stopPropagation()

        formSubmetido()
    })

    btnAddProduct.click(() => {
        if(criarProduto()){
            limpaCadastroDeProduto()
        }
    })

});

function formSubmetido(){
    toggleLoader()
    
    if (!validateInputsFornecedor()) {
        toggleLoader();
        toggleMessage('Dados do Fornecedor incompletos');
        return;
    }

    if (!cepInput.hasClass('is-valid')) {
        toggleLoader();
        $('#cep').addClass('is-invalid');
        toggleMessage("CEP inválido");
        return;
    }

    if(!validaCNPJ(cnpj.val())){
        toggleLoader()
        $('#cnpj').removeClass('is-valid')
        $('#cnpj').addClass('is-invalid')
        toggleMessage("CNPJ inválido");
        return;
    }

    if(!validateEmail()){
        toggleLoader();
        toggleMessage("E-mail inválido");
        email.removeClass('is-valid').addClass('is-invalid')
        return;
    }

    if(!validateTel()){
        toggleLoader();
        toggleMessage("Número de telefone inválido");
        tel.removeClass('is-valid').addClass('is-invalid')
        return;
    }
    
    $('.section-products').removeClass('border-red');
    if (carrinho.itens.length === 0) {
        toggleLoader();
        $('.section-products').addClass('border-red');
        toggleMessage('Adicione pelo menos um produto');
        return;
    }

    $('.section-anexos').removeClass('border-red');
    if (documentos.docs.length === 0) {
        toggleLoader();
        $('.section-anexos').addClass('border-red');
        toggleMessage('Anexe pelo menos um documento');
        return;
    }

    const camposDesejados = ['razaoSocial', 'nomeFantasia', 'cnpj', 'inscricaoEstadual', 
    'inscricaoMunicipal', 'nomeContato', 'telefoneContato', 'emailContato'];
    
    formData = new FormData(form);
    const dadosJson = {};

    for (let [chave, valor] of formData.entries()) {
        if (camposDesejados.includes(chave)) {
            dadosJson[chave] = valor;
        }
    }

    dadosJson.produtos = carrinho.itens.map(item => ({
        indice: item.indice,
        descricaoProduto: item.description,
        unidadeMedida: item.undMed,
        qtdeEstoque: item.qntEstoq,
        valorUnitario: item.valorUnid,
        valorTotal: item.valorTotal
    }));

    dadosJson.anexos = documentos.docs.map(item => ({
        indice: item.indice,
        nomeArquivo: item.nomeArquivo,
        blobArquivo: item.blobArquivo
    }));

    console.log(dadosJson);
    sessionStorage.setItem('jsonForm', JSON.stringify(dadosJson));

    setTimeout(() => {
        toggleLoader();
        toggleMessage("Fornecedor cadastrado com sucesso!");
        limparClassesValid();
        carrinho.limparCarrinho();
        documentos.limparDocumentos();
        form.reset();
    }, 1900);
}


const toggleLoader = () => {
    $('#fade').toggleClass('hide');
    $('#loader').toggleClass('hide');
}

const toggleMessage = (msg) => {
    const messageElement = $('#message');
    const messageElementText = $('#message p');

    messageElementText.text(msg);
    messageElement.toggleClass('hide');
    $('#fade').toggleClass('hide');
}
$('#close-message').on('click', () => toggleMessage())

const razaoSocial = $('#razao-social');
const nomeFantasia = $('#nome-fantasia');
const cepInput = $('#cep');
const address = $('#address');
const neighborhood = $('#neighborhood');
const contactPerson = $('#contact-person');
const region = $('#region');
const tel = $('#tel');
const number = $('#number');
const city = $('#city');
const email = $('#email');

function limpaCadastroDeProduto(){
    descriptionInput.val('');
    undInput.val('')
    qtdeInput.val('')
    valueUnInput.val('')
    descriptionInput.removeClass('is-valid', 'is-invalid')
    undInput.removeClass('is-valid', 'is-invalid')
    qtdeInput.removeClass('is-valid', 'is-invalid')
    valueUnInput.removeClass('is-valid', 'is-invalid')
}

$('#cep').on('keypress', function(e) {
    const onlyNumbers = /[0-9]/;
    const key = e.key;

    if (!onlyNumbers.test(key)) {
        e.preventDefault();
    }
});

$('#cep').on('keyup change', function(e) {
    cepInput.removeClass('is-valid').addClass('is-invalid')
    const cepValue = $(this).val().replace('-', '');

    if (cepValue.length === 8) {
        getAddress(cepValue);
    }
});

async function getAddress(cep){
    toggleLoader()
    cepInput.blur()
    
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const data = await response.json()
    
    if(data.erro === true){
        toggleLoader()
        toggleMessage("CEP inválido")
        cepInput.removeClass('is-valid').addClass('is-invalid')
        return false
    }
    
    address.val(data.logradouro) 
    city.val(data.localidade)   
    neighborhood.val(data.bairro)   
    region.val(data.uf)   
    cepInput.removeClass('is-invalid').addClass('is-valid')
    toggleLoader();
}

const cnpj = $('#cnpj')

cnpj.on('keyup', function(e) {
    const cnpjValue = $(this).val()

    if(validaCNPJ(cnpjValue)) {
        cnpj.removeClass('is-invalid').addClass('is-valid')
       
    }else{
        cnpj.removeClass('is-valid').addClass('is-invalid')
    }
});

function validaCNPJ(cnpjEntrada) {
    const cnpjTratado = cnpjEntrada.replace(/[^\d]+/g, '');

    if (cnpjTratado === '') return false;
    
    if (cnpjTratado.length !== 14) return false;

    // Lista de CNPJs inválidos
    const invalidos = [ "00000000000000", "11111111111111","22222222222222",
        "33333333333333", "44444444444444","55555555555555","66666666666666",
        "77777777777777", "88888888888888", "99999999999999"
    ];

    if (invalidos.indexOf(cnpjTratado) >= 0) return false;

    let tamanho = cnpjTratado.length - 2
    let numeros = cnpjTratado.substring(0, tamanho);
    let digitos = cnpjTratado.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0), 10)) return false;

    tamanho = tamanho + 1;
    numeros = cnpjTratado.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(1), 10)) return false;

    return true;
};

function validateEmail(){
    var email = $('#email').val();
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    
    if (!emailPattern.test(email)) {
        return false
    }
    return true
}

function validateTel() {
    var tel = $('#tel').val();
    
    if (!tel) {
        return false;
    }

    var telTratado = tel.replace(/\D/g, '');

    var telPattern  = /^\d{10,11}$/;

    if (!telPattern.test(telTratado)) {
        return false;
    }
    return true;
}

function addClassValid(input){
    if(!input.val()){   
        input.removeClass('is-valid').addClass('is-invalid')
     return false
    }
    if(input.val()){
        input.removeClass('is-invalid').addClass('is-valid')
        return true
    }
}

function validateInputsFornecedor() {
    const inputElements = [
        razaoSocial, nomeFantasia, address, number, neighborhood,
        region, city, contactPerson, tel, email
    ];

    for (const input of inputElements) {
        if (!addClassValid(input)) {
            return false;
        }
    }

    return true;
}

function limparClassesValid() {
    const inputs = [razaoSocial, cnpj, nomeFantasia, address, number, neighborhood, region, city, 
    contactPerson, tel, email, cepInput, descriptionInput, undInput, qtdeInput, valueUnInput];

    inputs.forEach(campo => {
        campo.removeClass('is-valid', 'is-invalid');
    });
}

//Section de produtos
const btnAddProduct = $('#btn-add-product');
const registeredProducts = $('.registered-products');
const btnInclude = $('#btn-include');
const descriptionInput = $('#description');
const undInput = $('#und');
const qtdeInput = $('#qtde');

class Produto{
    constructor(indice, description, undMed, qntEstoq, valorUnid){
        this.indice = indice
        this.description = description
        this.undMed = undMed
        this.qntEstoq = qntEstoq
        this.valorUnid = valorUnid
        this.valorTotal = qntEstoq * valorUnid
    }
}

const xModal = $('.x-modal')
const valueUnInput = $('#value-un')
let indice = 0

function criarProduto(){
    let boolean = true

    if(!addClassValid(descriptionInput)) boolean = false
    if(!addClassValid(undInput)) boolean = false
    if(!addClassValid(qtdeInput)) boolean = false
    if(!addClassValid(valueUnInput)) boolean = false

    if(!boolean) return false;

    const produto = new Produto(indice = 1, descriptionInput.val(), 
    undInput.val(), qtdeInput.val(), valueUnInput.val())

    carrinho.adicionarItem(produto)
    carrinho.exibirEAtualizarCarrinho()
    xModal.click()
    return true;
}

class Carrinho{
    constructor(){
        this.itens = []
    }
    
    adicionarItem(produto){
        this.itens.push(produto)
        this.attIndice()
        this.exibirEAtualizarCarrinho();
    }

    attIndice(){
        let indice = 0
        this.itens.map(produto => {
            indice++
            produto.indice = indice
            return produto
        })
    }
    
    removerItem(produto) {
        for (let i = 0; i < this.itens.length; i++) {
            if (this.itens[i].indice === produto.indice) {
                  this.itens.splice(i, 1);
                  return; // Sai do loop após remover o produto correto
            }
        }
    }

    exibirEAtualizarCarrinho(){

        registeredProducts.empty();

        for(const produto of this.itens){
  
            const div = $('<div>').addClass('row mt-5');

            const produtosInfo = `
            <i class="bi-trash col-1 align-self-center bi bi-trash-fill p-1 btnRemoveItem" id="trash" data-indice=${produto.indice}></i>
            <fieldset class="col-10 col-md-11 custom-fieldset border div-item">
                <legend class="custom-legend legend-item">Produto - ${produto.indice}</legend>
                <div class="row">
                    <div class="image-product col-3 align-self-center"> 
                        <img src="../public/product.png" alt="Descrição da imagem">
                    </div>
                    <div class="col-12 col-sm-9">
                        <div class="input-group row col-11 mx-auto my-2">
                            <label class="form-label" for="description-item">Produto: </label>
                            <input type="text" class="form-control" id="description-item" value="${produto.description}" readonly>
                        </div>
                        <div class="row d-flex align-items-end">
                            <div class="col-6 col-sm-3">
                                <label class="form-label" for="und-item">Und. Medida</label>
                                <input class="form-control" type="text" id="und-item" value="${produto.undMed}" readonly>
                            </div>
                            <div class="col-6 col-sm-3">
                                <label class="form-label" for="qtde-item">Qtde. em Estoque</label>
                                <input class="form-control" type="number" id="qtde-item" value="${produto.qntEstoq}" readonly>
                            </div>
                            <div class="col-6 col-sm-3">
                                <label class="form-label" for="value-un">Valor Unitário</label>
                                <input class="form-control" type="text" id="value-un-item" value="R$ ${produto.valorUnid}" readonly>
                            </div>
                            <div class="col-6 col-sm-3">
                                <label class="form-label" for="total-item">Valor total</label>
                                <input class="form-control" type="text" id="total-item" value="R$ ${produto.valorTotal}" disabled>
                            </div>
                        </div>
                    </div>
                </div>
            </fieldset>
            `
                
            div.html(produtosInfo)
            registeredProducts.append(div)
            $('.section-products').removeClass('border-red');
        }
    }
        
    limparCarrinho() {
        this.itens = [];
        this.exibirEAtualizarCarrinho();
    }
}

$(document).on('click', '.btnRemoveItem', function() {
    const indiceProduto = $(this).data('indice');
    const produto = carrinho.itens.find(p => p.indice === indiceProduto);
    carrinho.removerItem(produto);
    carrinho.attIndice();
    carrinho.exibirEAtualizarCarrinho();
});


const carrinho = new Carrinho()
carrinho.exibirEAtualizarCarrinho();

class Documento{
    constructor(indice, nomeArquivo, blobArquivo){
        this.indice = indice
        this.nomeArquivo = nomeArquivo
        this.blobArquivo = blobArquivo
    }
}

class Documentos{
    constructor(){
        this.docs = []
    }

    adicionarItemDoc(documento){
        this.docs.push(documento)
        this.attIndiceDoc()
        this.exibirEAtualizarDocumentos()
        documentos.salvarSessionStorage()
    }
    
    attIndiceDoc(){
        let indice = 0
        this.docs.map(documento => {
            indice++
            documento.indice = indice
            return documento
        })
    }

    removerItemDoc(documento) {
      for (let i = 0; i < this.docs.length; i++) {
          if (this.docs[i].nomeArquivo === documento.nomeArquivo) {
              this.docs.splice(i, 1);
              return; // Sai do loop após remover o produto correto
            }
        }
    }

    salvarSessionStorage(){
        const jsonDocs = JSON.stringify(this.docs)
        sessionStorage.setItem('files', jsonDocs)
    }

    removerSessionStorage(indice){
        indice--
        let dadosSession = sessionStorage.getItem('files')
        dadosSession = JSON.parse(dadosSession)
        
        dadosSession.splice(indice, 1)
        this.attIndiceDoc()
        sessionStorage.clear()
        this.salvarSessionStorage()
    }

    exibirEAtualizarDocumentos(){

        divDocuments.innerHTML = '';

        for(const documento of this.docs){
            const div = document.createElement('div')
            div.classList.add('doc-item')
            div.classList.add('d-flex')
            div.classList.add('align-items-center')
            const docsInfo = `
                <i class="bi bi-trash btn-remove-doc"></i>
                <i class="bi bi-eye btn-download"></i>
                <span class="align-self-center" id="doc-name">${documento.nomeArquivo}</span>
            `
                
            div.innerHTML = docsInfo
            divDocuments.appendChild(div)
            $('.section-anexos').removeClass('border-red');

            const btnRemoveDoc = div.querySelector('.btn-remove-doc');
            btnRemoveDoc.addEventListener('click', () => {
                this.removerItemDoc(documento);
                this.removerSessionStorage(documento.indice)
                this.attIndiceDoc()
                this.exibirEAtualizarDocumentos();
            });

            const btnDownload = div.querySelector('.btn-download')
            btnDownload.addEventListener('click', function(){
                download()(documento.blobArquivo, documento.nomeArquivo)
            })
        }
    }

    limparDocumentos() {
        this.docs = [];
        this.exibirEAtualizarDocumentos();
    }
}

const divDocuments = document.querySelector('.div-documents')
const inputDocumento = document.querySelector('#file-input')
const fieldsetAnexos = document.querySelector('#fieldset-anexos')

let conteudo = ''
let nomeArq = ''

inputDocumento.addEventListener('change', function(){
    if (this.files && this.files.length > 0) fieldsetAnexos.classList.remove('border-red')

    const arquivo = this.files[0]
    const reader = new FileReader()

    reader.addEventListener('load', function(){
        conteudo = reader.result
        const blob = new Blob([conteudo], {type: 'octet/stream'})
        nomeArq = arquivo.name
        const documento = new Documento(indice = 1, nomeArq, blob)
        documentos.adicionarItemDoc(documento)
    })

    if(arquivo){
        reader.readAsArrayBuffer(arquivo);
    }
})

const download = function(){
    const a = document.createElement('a')
    a.style = 'display: none'
    document.body.appendChild(a)
    return function(blob, nomeArquivo){
        const url = window.URL.createObjectURL(blob)
        a.href = url
        a.download = nomeArquivo
        a.click()
        window.URL.revokeObjectURL(url)
    }
}

const documentos = new Documentos();