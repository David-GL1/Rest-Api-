//Declaraciones de variables globales
const body = document.body

//FUNCIONES CREADORAS DE ELEMENTOS DINAMICAMENTE

//Funcion para crear btns
const createBtn = (parentContainer, classBtn, contentBtn, iconClasess) => {
    //Creacion de los elementos del btn
    const btn = document.createElement("button")
    btn.classList.add("btn-general", classBtn)

    const frontSpan = document.createElement("span")
    frontSpan.classList.add("front")
    frontSpan.textContent = contentBtn

    const backSpan = document.createElement("span")
    backSpan.classList.add("back")

    const icon = document.createElement("i")
    icon.classList.add(...iconClasess)

    backSpan.appendChild(icon)

    btn.appendChild(frontSpan)
    btn.appendChild(backSpan)

    parentContainer.appendChild(btn)

    return btn
}


const createMessage = (mainContainer, classIcon, contentTitle, contentText) => {
   
    mainContainer.textContent = ""

    const msjContainer = document.createElement("div")
    msjContainer.classList.add("messageContainer")

    const icon = document.createElement("i")
    icon.classList.add(...classIcon, "messageContainer__icon")
    
    const title = document.createElement("h2")
    title.textContent = contentTitle;
    title.classList.add("messageContainer__title", "generalTitle")

    const text = document.createElement("p")
    text.textContent = contentText
    text.classList.add("messageContainer__text", "generalText")

    msjContainer.appendChild(icon)
    msjContainer.appendChild(title)
    msjContainer.appendChild(text)

    mainContainer.appendChild(msjContainer) 
}

const createAlert = (parentContainer, iconClassesAlert, textContentTitle, textContentContent, classBtn, contentBtn, iconClasessBtn,  btnActionClose = false) => {

    const alertBackground = document.createElement("section")
    alertBackground.classList.add("overlayAlert")

    let containerAlert = document.querySelector(".containerAlert")

    if(!containerAlert){

    //Creacion del contenedor del alert
    containerAlert = document.createElement("article")
    containerAlert.classList.add("containerAlert")

    setTimeout(() => {
        alertBackground.classList.add("active")
        containerAlert.classList.add("active")
        body.classList.add("noScrollActive")
    },200)

    const iconCloseAlert = document.createElement("i")
    iconCloseAlert.classList.add("iconCloseAlert", "fa-solid", "fa-xmark", "link")

    iconCloseAlert.addEventListener("click", () => {
        
        containerAlert.classList.remove("active")
        alertBackground.classList.remove("active")
        body.classList.remove("noScrollActive")

        setTimeout(() => {
            alertBackground.remove()
            containerAlert.remove()
        }, 200)
    })

    const containerIcon = document.createElement("div")
    containerIcon.classList.add("containerAlert__containerIcon")

    const icon = document.createElement("i")
    icon.classList.add(...iconClassesAlert, "iconAlert")

    const containerContent = document.createElement("div")
    containerContent.classList.add("containerAlert__containerContent")

    const contentTitle = document.createElement("h3")
    contentTitle.classList.add("containerAlert__containerContent--title") 
    contentTitle.textContent =  textContentTitle

    const contentText = document.createElement("p");
    contentText.classList.add("containerAlert__containerContent--text");
    contentText.textContent = textContentContent

    //Creacion del btn
    const btn = createBtn(
        containerContent, 
        classBtn, 
        contentBtn, 
        iconClasessBtn
    )

    if(btnActionClose){
        btn.addEventListener("click", () => {
        containerAlert.classList.remove("active")
        alertBackground.classList.remove("active")
        
        setTimeout(() => {
            containerAlert.remove()
            alertBackground.remove()
            body.classList.remove("noScrollActive")
        }, 200)
    })
    }
    
    parentContainer.appendChild(alertBackground)
    parentContainer.appendChild(containerAlert)
    containerAlert.appendChild(iconCloseAlert)

    containerAlert.appendChild(containerIcon)
    containerIcon.appendChild(icon)

    containerAlert.appendChild(containerContent)
    containerContent.appendChild(contentTitle)
    containerContent.appendChild(contentText)
    containerContent.appendChild(btn)
    }
}

// CREACION de la card por show en index
const createShowCard = (genreId, shows, addRanking = false) => {
    const titleByGenre = document.getElementById(genreId);

    const containerByGenre = document.createElement('div');
    containerByGenre.classList.add('gridShows__conteinerCards');

    shows.forEach((show, index) => {
        const cardShow = document.createElement('article');
        cardShow.classList.add('gridShows__card', "card-general");
        cardShow.style.background = `url(${show.image.original}) center/cover no-repeat`;
        
        if (addRanking) {
            const numberRanking = document.createElement('span');
            numberRanking.classList.add('numberRanking');
            numberRanking.textContent = index + 1;
            cardShow.appendChild(numberRanking);
        }

        containerByGenre.appendChild(cardShow);
    });

    titleByGenre.insertAdjacentElement('afterend', containerByGenre);
};

// RENDERIZAR las cards por show en index 
const loadCards = async () => {
    try {
        const response = await axios.get("https://api.tvmaze.com/shows");
        const allShows = response.data;

        // Cards destacables con ranking
        const notableShows = allShows.filter(show => typeof show.rating?.average === "number").sort((a, b) => b.rating.average - a.rating.average).slice(0, 10);
        //Cards por genero
        const actionShows = allShows.filter(show => show.genres.includes("Action")).slice(0, 15);
        const comedyShows = allShows.filter(show => show.genres.includes("Comedy")).slice(0, 15);
        const scienceFictionShows = allShows.filter(show => show.genres.includes("Science-Fiction")).slice(0, 15);
        const dramaShows = allShows.filter(show => show.genres.includes("Drama")).slice(0, 15);
        const thrillerShows = allShows.filter(show => show.genres.includes("Thriller")).slice(0, 15);

        createShowCard("notables", notableShows, true);
        createShowCard("accion", actionShows);
        createShowCard("comedy", comedyShows);
        createShowCard("cienciaFiccion", scienceFictionShows);
        createShowCard("drama", dramaShows);
        createShowCard("thrillers", thrillerShows);

        return {
            notableShows, actionShows, comedyShows, scienceFictionShows, dramaShows, thrillerShows
        };
        
    } catch (error) {
        console.log(`Error al cargar ${error}`);
    }
};

// DETECTAR el CLICK sobre card y RENDERIZAR MODAL
const detectClick = (shows, containerId) => {
    /*Se seleciona el titulo por medio del id y se obtiene el hermano siguiente de ese elemento}
     que es el contenedor dependiendo del genero*/
    const container = document.getElementById(containerId).nextElementSibling;

    container.addEventListener("click", (e) => {
        const clickedCard = e.target.closest(".gridShows__card");

        if (!clickedCard) return;

        const cards = [...container.children];
        const indexCard = cards.indexOf(clickedCard);

        const showInfo = shows[indexCard];

        showInfo && createModal(showInfo);
    });
}

// CREACION del MODAL
const createModal = (showInfo) => {
    // Verificación si ya existe un modal en el DOM
    let modal = document.querySelector(".modal");

    if (!modal) {
        modal = document.createElement("article");
        modal.classList.add("modal");
        //Clase agregada para desactivar cuando el modal se crea en el DOM
        body.classList.add("noScrollActive")

        // Un delay para que le de tiempo de renderizar el modal el DOM y luego agregar la clase active y se puede observar la animacion
        setTimeout(() => {
            modalBackground.classList.add("active")
            modal.classList.add("active");
        }, 200);

        const modalBackground = document.createElement("section")
        modalBackground.classList.add("overlayModal")

        const modalContainerImg = document.createElement("article");
        modalContainerImg.classList.add("modal__containerImg");

        const modalImage = document.createElement("img");
        modalImage.classList.add("modal__containerImg--img");
        modalImage.src = `${showInfo.image.original}`;

        //Creacion de cotenedor de btn "Favorites y Close modal"
        const modalContainerActions = document.createElement("div")
        modalContainerActions.classList.add("modal__containerActions")

        // Creación del btn para cerrar el modal
        const btnCloseModal = document.createElement("i");
        btnCloseModal.classList.add("btnCloseModal", "fa-solid", "fa-xmark", "link");
 
        //Creacion del btn para agregar a favoritos
        const btnAddToFavorites = document.createElement("i")
        btnAddToFavorites.classList.add("btnAddToFavorites", "fa-regular", "fa-heart", "link")

        //Obtener todo el array de usuarios creados
        const arrayUser = JSON.parse(localStorage.getItem("users")) || [];
        //Obtener el correo el cual esta activo para agregar favoritos
        const userEmailActive = JSON.parse(localStorage.getItem("Sesion activa"))
        //Encontrar al usuario con datos y sus favoritos
        const searchAccount = arrayUser.find(user => user.email === userEmailActive)

        let showExist = false

        //Si hay una sesion activa y se encuentra esa sesion en arrayUser
        if (userEmailActive && searchAccount) {
            //Se busca el show favorito
            showExist = searchAccount.favorites.some(show => show.id === showInfo.id)

            if (showExist) {
                //Si el show wxiste se le agrega la clase de showAddedToFavorites
                btnAddToFavorites.classList.add("showAddedToFavorites")
            }else{
                //Si no se quita
                btnAddToFavorites.classList.remove("showAddedToFavorites")
            }
        }

        //Evento de cerrar el modal
        modalContainerActions.addEventListener("click", (e) => {
            if(e.target.classList.contains("btnCloseModal")){
                modal.classList.remove("active");
                modalBackground.classList.remove("active")
            // Delay para que al momento de cerrarse el modal le de tiempo de ejecutar primero la animacion y despues eliminar del DOM
            setTimeout(() => {
                modal.remove()
                modalBackground.remove()
                body.classList.remove("noScrollActive");
                }, 200);
            }

            //Btn de agregar a favoritos
            if(e.target.classList.contains("btnAddToFavorites")){
                if(localStorage.getItem("Sesion activa")){
                    
                    //Si el show no se ha agregado se agrega 
                    if(!showExist){
                        //Se agrega el show Favorito a searchAccount
                        searchAccount.favorites.push(showInfo)
                        localStorage.setItem("users", JSON.stringify(arrayUser))

                        btnAddToFavorites.classList.add("showAddedToFavorites")

                    }else{
                        //Si el show ya se existe se busca por su index y se elimina
                        const index = searchAccount.favorites.findIndex(show => show.id === showInfo.id)

                        if (index !== -1) {
                            btnAddToFavorites.classList.remove("showAddedToFavorites")
                            searchAccount.favorites.splice(index, 1);
                            localStorage.setItem("users", JSON.stringify(arrayUser));}               
                    }

                }else{
                    createAlert(
                        body, 
                        ["fa-solid", "fa-triangle-exclamation"], 
                        "Accion no permitida", 
                        "Debes iniciar sesión para poder agregar favoritos.", 
                        "containerAlert__containerContent--btnRedirectToLogin", 
                        "Crear cuenta", 
                        ["fa-solid", "fa-user-plus"])

                    const btnRedirectToLogin = document.querySelector(".containerAlert__containerContent--btnRedirectToLogin")
                    btnRedirectToLogin.addEventListener("click", () => {
                        window.location = "login.html"
                    })
                    
                }
            }
        })

        modalContainerActions.appendChild(btnAddToFavorites)
        modalContainerActions.appendChild(btnCloseModal)

        const titleShow = document.createElement("h2");
        titleShow.classList.add("modal__containerInfoShow--title", "generalTitle");
        titleShow.textContent = showInfo.name;

        const containerGenres = document.createElement("div");
        containerGenres.classList.add("modal__containerGenres");

        const moreInfoContainer = document.createElement("div");
        moreInfoContainer.classList.add("modal__containerMoreInfo");

        // Más información, lenguaje, país, etc
        const moreInfo = {
            "language": showInfo.language,
            "status": showInfo.status,
            "network": showInfo.network?.country.name,
            "rating": showInfo.rating?.average,
        };

        // Creación de span por key y value de moreInfo
        Object.entries(moreInfo).forEach(([key, value]) => {

            if(value === null || value === undefined){
                return;
            }

            const span = document.createElement("span");
            span.classList.add("modal__containerMoreInfo--span", "generalText");

            if (key === "rating" && typeof value === "number") {
                if (value >= 8.3) {
                    span.classList.add("goodShow")
                } else if (value >= 7) {
                    span.classList.add("regularShow")
                } else {
                    span.classList.add("badShow")
                }
            }

            span.textContent = `${key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}: ${value}`;

            moreInfoContainer.appendChild(span);
        });

        // Creación de span por cada género del show
        showInfo.genres.forEach(genre => {
            const genreSpan = document.createElement("span");
            genreSpan.classList.add("modal__containerInfoShow--genre", "generalText", `${genre.toLowerCase()}`);
            genreSpan.textContent = genre;

            containerGenres.appendChild(genreSpan);
        });

        const synopsisContainer = document.createElement("div");
        synopsisContainer.classList.add("modal__synopsisContainer");

        const synopsis = document.createElement("p");
        synopsis.classList.add("modal__synopsisContainer--synopsis", "generalText");
        synopsis.textContent = showInfo.summary.replace(/<[^>]*>/g, "");

        document.body.appendChild(modalBackground);
        document.body.appendChild(modal)

        modal.appendChild(modalContainerImg);
        modalContainerImg.appendChild(modalImage);

        synopsisContainer.appendChild(modalContainerActions)
        synopsisContainer.appendChild(titleShow);
        synopsisContainer.appendChild(moreInfoContainer);
        synopsisContainer.appendChild(containerGenres);
        modal.appendChild(synopsisContainer);
        synopsisContainer.appendChild(synopsis);
    }
};

//Buscar un show
const searchShow = async () => {
    //Obtener el valor del input
    const valueInput = document.getElementById("inputSearch").value.toLowerCase()
    //Section "gridShows" contenedor Padre
    const gridShows = document.querySelector(".gridShows")
    //Verificacion si se busca por un numero "id"
    const isNumeric = !isNaN(valueInput) && Number.isInteger(Number(valueInput));

    //Creacion del titulo con Id con textContent "Resultados de busqueda"
    const titleResult = document.createElement("h2")
    titleResult.classList.add("titleFoundResult")
    titleResult.id = "results"
    titleResult.textContent = "Resultados de busqueda"

    //Si el valor del input esta vacio no sucede nada
    if(valueInput.trim() === "") {
        return; 
    }


    try{
        let results

        //Limpieza de gridShows para que se pueda realizar otra busqueda y no aprezca contenido buscado anteriormente
        gridShows.textContent = ""

        //Si el valor es numerico es decir busqueda por id
        if(isNumeric){
            results = await axios.get(`https://api.tvmaze.com/shows/${Number(valueInput)}`);

            gridShows.textContent = ""

            const  idShow = [results.data]
            //Insercion al DOM al titulo  con id "results"
            gridShows.appendChild(titleResult)

            const cardShow = createShowCard(titleResult.id, idShow)

            detectClick(idShow, "results")

        
        }
        //Si no la busqueda se realiza por medio del nombre
        else{
            results = await axios.get(`https://api.tvmaze.com/search/shows?q=${valueInput}`);

            //Mostrar "SIN REUSLTADOS"
            if(results.data.length === 0){

                createMessage(
                    gridShows, 
                    ["fas", "fa-meh"],
                    "Ups, parece que no tenemos ese titulo",
                    "Prueba con otro título o intenta una búsqueda diferente"
                    )

                return
            }

            //Mostrar todas las coincidencias si es que existen
            const shows = results.data.map((show) => show.show)
            // Inserción al DOM del título con ID "results"
            gridShows.appendChild(titleResult);
            createShowCard(titleResult.id, shows)

            const containerCards = document.querySelector(".gridShows__conteinerCards")
            containerCards.classList.add("displayGrid")

            detectClick(shows, "results")
        }

    }catch (error){
        console.log(`Erorr ${error}`)
    }
}

//Aparicion del input de busqueda de show
const btnShowContainerSearch = document.getElementById("btn-search")

if(btnShowContainerSearch){
    btnShowContainerSearch.addEventListener("click", () => {
    const containerParent = document.querySelector(".containerSearch__container")
    const inputSearch = document.querySelector(".containerSearch__container--input")
    const btnToSearch = document.querySelector(".containerSearch__container--btn")

    //Condicional para controlar mejor la animacion y se vea una aniamcion mas suave como de entrada como de salida
    if(containerParent.classList.contains("active")){
        inputSearch.classList.remove("active")
        btnToSearch.classList.remove("active")

        setTimeout(() => {
            containerParent.classList.remove("active")
        }, 400)

    }else{
        containerParent.classList.add("active")

        setTimeout(() => {
            inputSearch.classList.add("active")
            btnToSearch.classList.add("active")
        }, 50)
    }
})
}

//Evento en index.html, al btn de busqueda de show si se da click al btn se ejecuta la funcion searchShow
const btnSearchIndex = document.getElementById("btnSearch")
if(btnSearchIndex){
    btnSearchIndex.addEventListener("click", searchShow)
}

//Evento de index.html, si se preiona enter se ejecuta la funcion searchShow
    const inputSearchIndex = document.getElementById("inputSearch")
    if(inputSearchIndex){
     inputSearchIndex.addEventListener("keydown", (e) => {
        if(e.key === "Enter"){
            searchShow()
        }
    })
}

//Comporbar si el usuario tiene una cuenta existente
const checkAccount = () => {
    const AccountEmailBtn = document.querySelector(".containerForm__form--btnCheckAccount")
    const emailValidation = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    //Validacion de "users", si no existe se crea para poder guardar los usuarios con toda su info
    if(!localStorage.getItem("users")){
        localStorage.setItem("users", JSON.stringify([]))
    }

    //Evento al hacer click sobre el btn
    AccountEmailBtn.addEventListener("click", (e) => {
    e.preventDefault()

    //Valor del input de correo
    const valueInputEmail = document.querySelector(".containerGeneralForm__form--inputEmail").value

    if(valueInputEmail.trim() === "") {
        return; 
    }

    if(!emailValidation.test(valueInputEmail)){
        alert("Debes de ingresa un correo electronico valido")
        return;
    }

    const arrayAccounts = JSON.parse(localStorage.getItem("users")) || [];

    const accountExist = arrayAccounts.some(user => user.email === valueInputEmail)

        //Comprobar si la cuenta existe
    if(accountExist){
        //Agregar estatus de cuenta ("activo")
        localStorage.setItem("Sesion activa", JSON.stringify(valueInputEmail))

        //Msj de confirmacion de sesion de cuenta activa
        const containerCenterAllLogin = document.querySelector(".centerAll")

        createMessage(
            containerCenterAllLogin, 
            ["fas", "fa-user-check"],
            "Inicio de sesion exitoso",
            "En breve será redirigido a la página principal.")
            
        setTimeout(() => {
            window.location.href = "index.html";
        }, 4000)

    }else{
        //Si no existe la cuenta se le envia al usuario a la pagina de crear cuenta
        window.location.href = "createAccount.html";
    }}
    ) 
}

//Crear una cuenta al usuario
const createAccount = () => {
    //Btn
    const createAccountBtn = document.querySelector(".containerGeneralForm__btnCreateAccount")

    //Evento al presionar el btn
    createAccountBtn.addEventListener("click", (e) => {
        e.preventDefault()

        //Nombre y apellidos de usuario
        const valueNameInput = document.querySelector(".containerGeneralForm__containerDatauser--inputName").value
        const valueLastNameInput = document.querySelector(".containerGeneralForm__containerDatauser--inputLastName").value

        //Valor de correo electronico
        const valueInputEmail = document.querySelector(".containerGeneralForm__containerDatauser--inputEmail").value

        //Array completo de usuarios
        const usersArray = JSON.parse(localStorage.getItem("users")) || [];

        //Confirmar si el correo ingresado es igual a uno de los que ya existen en el array de usuarios
        const isEmailRegistered = usersArray.some(user => user.email ===  valueInputEmail)

        //Verificar que el usuario meta un correo valido
        const emailValidation = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        //Si algun input esta vacio se ejecuta el alert informando del problema
        if(valueNameInput.trim() === "" || valueLastNameInput.trim() === "" || valueInputEmail.trim() === "" ) {
            alert("No se pueden dejar campos vacios, porfavor llene los campos faltantes")
            return; 
        }

         //Si el correo no es valido, se le pide al usuario que ingrese otro correo
        if(!emailValidation.test(valueInputEmail)){
            alert("Debes de ingresa un correo electronico valido")
            return;
        }  

        //Si el usuario mete un correo que ya existe le suelta el alert de que debe de utilizar otro
        if(isEmailRegistered){
            alert("Ese correo electronico ya esta en uso, utilice otro por favor.")
            return;
        }
 
        const newUser = {
            name: valueNameInput,
            lastName: valueLastNameInput,
            email: valueInputEmail,
            favorites: []
        }

        usersArray.push(newUser)

        localStorage.setItem("users", JSON.stringify(usersArray))
        localStorage.setItem("Sesion activa", JSON.stringify(valueInputEmail))

        //Contenedor padre de todo el form
        const mainContainer = document.querySelector(".centerAll")

        //Confirmacion de que la cuenta fue creada con exito
         createMessage(
                mainContainer, 
                ["fa-solid", "fa-user-check"],
                "Cuenta registrada con éxito",
                "En breve será redirigido a la página principal")


         setTimeout(() => {
            window.location.href = "index.html";
         }, 4000)
    })
}

//Btn para abrir el aside de usuario
const btnUserPanel = document.querySelector(".btnUserPanel")

//Incorporacion del evento al btn btnUserPanel
if(btnUserPanel){
        //Eventos del asideUser
        btnUserPanel.addEventListener("click", () => {
        document.querySelector(".asideUser").classList.toggle("active");
    });
}

//Aside de usuario
const asideUser = document.querySelector(".asideUser")

//Incorporacion de evento al asideUser
if(asideUser){
    asideUser.addEventListener("click", (e) => {
    //Btn para cerrar el aside
    if(e.target.classList.contains("asideUser__containerClose")){
         document.querySelector(".asideUser").classList.toggle("active");
    }

    //Btn de cuenta
    if(e.target.classList.contains("accountBtn")){
        /*Si el usuario tiene una cuenta activa lo manda a la pagina de account.html para que 
        pueda ver los datos con los que creo su cuenta, si no lo manda a la pagina de login.html
        para que inicie sesion o verifique si tiene una cuneta si no que la cree*/
        const accountBtn = e.target

        if(localStorage.getItem("Sesion activa")){
            accountBtn.href = `/account.html`
        }else{
            accountBtn.href = `/login.html`
        }
    }

    //Btn para cerrar sesion
    if(e.target.classList.contains("closeAccount")){
        //Creamos el alert para comprobar si el usuario quiere cerrar su sesion
        createAlert(
            body, 
            ["fa-solid", "fa-circle-exclamation"], 
            "¿Deseas cerrar tu sesión?", 
            "Esta acción cerrará tu sesión activa. ¿Quieres continuar?", 
            "btnConfirmCloseAccoutn", 
            "Aceptar", 
            ["fa-solid", "fa-right-from-bracket"],
            true)

        //Agregamos evento al btn para que cunado le de click la sesion activa se cierre
        setTimeout(()=> {
            const btnAceptCloseAccount = document.querySelector(".btnConfirmCloseAccoutn")

            btnAceptCloseAccount.addEventListener("click", () => {
            localStorage.removeItem("Sesion activa")
            //Borrar el btn de cerrar cuenta
            const btnCloseAccount = document.querySelector(".closeAccount")
            btnCloseAccount.remove()
        
            setTimeout(() => {
                createAlert(
                body, 
                ["fa-solid", "fa-right-from-bracket"], 
                "Sesion cerrada correctamente", 
                "Gracias por visitar nuestra plataforma. ¡Esperamos verte pronto de nuevo!", 
                "btnConfirmCloseAccoutn", 
                "Aceptar", 
                ["fa-solid", "fa-check"],
                true
            )
            }, 400)
        })
        }, 200)
    }
})
}

// CREACION de Favoritos
const createFavoritesCard = (favoritesArray) => {
    
    const gridFavorites = document.querySelector(".gridFavorites")
    
    favoritesArray.forEach(showFavorite => {
        const articleShow = document.createElement("article")
        articleShow.classList.add("gridFavorites__card",  "card-general")

        const imgFavoriteShow = document.createElement("img")
        imgFavoriteShow.classList.add("gridFavorites__img")
        imgFavoriteShow.src = showFavorite.image.original
        imgFavoriteShow.dataset.id = showFavorite.id

        const containerDeleteBtn = document.createElement("div")
        containerDeleteBtn.classList.add("gridFavorites__containerDelete")

        //Creación del botón por medio de la función para crear botones
        const btnDeleteShow = createBtn(
            containerDeleteBtn, 
            "gridFavorites__containerDelete--btn", 
            "Borrar", 
            ["fa-solid", "fa-trash"]);

        //Agregando dataset al btn para eliminar el show
        btnDeleteShow.dataset.id =  showFavorite.id

        //Meter todo dentro del article de la card
        articleShow.appendChild(imgFavoriteShow)
        articleShow.appendChild(containerDeleteBtn)

        //Meter todo dentro del contenedor principal
        gridFavorites.appendChild(articleShow)
    })
};

//Opciones las cuales se pueden realizar en la pagina de favoritos
const optionsFavorites = () => {
    const userEmail = JSON.parse(localStorage.getItem("Sesion activa"));
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const findUserActiveSession = users.find(user => user.email === userEmail)
    const gridFavorites = document.querySelector(".gridFavorites")

    if(gridFavorites){
        gridFavorites.addEventListener("click", (e) => {

            //Creacion de modal por cada show 
            if(e.target.classList.contains("gridFavorites__img")){
                const idShowCard = parseInt(e.target.dataset.id)
                //Encontramos el show el cual coincide con el dataset id
                const findShowToCreateModal = findUserActiveSession.favorites.find(show => show.id ===  idShowCard)
                createModal(findShowToCreateModal)
            }

            //Buscar por medio del dataset al show el cual se desea eliminar de las lista de favoritos del usuario
            if (e.target.closest(".gridFavorites__containerDelete--btn")) {
                //Se busca el btn mas cercano donde se dio el click
                const deleteBtn = e.target.closest(".gridFavorites__containerDelete--btn")
                //Se obtiene el dataset de show que es el id del show
                const idShow = parseInt(deleteBtn.dataset.id);
                //Se busca y se elimina el show
                const findShowToRemove = findUserActiveSession.favorites.findIndex(show => show.id === idShow)

                //Se obtiene la card mas cercana al btn donde se realizo el click
                const favoriteCard = deleteBtn.closest(".gridFavorites__card")
    
                if(findShowToRemove !== -1){   
                    //Se le quita la clase a favorite card para que haga una animacion de slaida
                    favoriteCard.classList.add("remove")

                    setTimeout(() => {
                        //Se elimina del DOM
                        favoriteCard.remove() 

                        //Quitar el show del array de favoritos
                        findUserActiveSession.favorites.splice(findShowToRemove, 1)
                        //Guardar cambios
                        localStorage.setItem("users", JSON.stringify(users))
                    
                        gridFavorites.textContent = ""
                    
                        //Verificar si quedan favoritos agregados
                        if(findUserActiveSession.favorites.length > 0){
                            gridFavorites.classList.remove("noFavoritesAdded")
                            createFavoritesCard(findUserActiveSession.favorites)
                        }else{
                            gridFavorites.classList.add("noFavoritesAdded")
                            createMessage(
                                gridFavorites, 
                                ["fas", "fa-meh"],
                                "Ups, parece que no hay shows agregados a favoritos ",
                                "Agrega shows a favoritos desde la pagina principal"
                            )
                        }
                    }, 200)
                }       
            }
        })
    }
}

const showUserData = () => {
    if(localStorage.getItem("Sesion activa")){

        const userEmail = JSON.parse(localStorage.getItem("Sesion activa"));
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const findUserActiveSession = users.find(user => user.email === userEmail)

        const nameUserValueInput = document.querySelector(".containerGeneralForm__containerDatauser--inputNameValue")
        const lastNameUserValueInput = document.querySelector(".containerGeneralForm__containerDatauser--inputLastNameValue")
        const emailUserValueInput = document.querySelector(".containerGeneralForm__containerDatauser--inputEmailValue")

        nameUserValueInput.value = findUserActiveSession.name
        lastNameUserValueInput.value = findUserActiveSession.lastName
        emailUserValueInput.value = findUserActiveSession.email
    }
}

const updateData = () => {
    //Habilitar inputs
    document.querySelector(".containerGeneralForm__containerDatauser--inputNameValue").disabled = false
    document.querySelector(".containerGeneralForm__containerDatauser--inputLastNameValue").disabled = false
    document.querySelector(".containerGeneralForm__containerDatauser--inputEmailValue").disabled = false

    //Contenedor de los btns
    const containerBtnsOptionsUser = document.querySelector(".containerGeneralForm__containerBtns")

    //Btns a eliminar para poder mostar el btn de guardar datos actualizados
    const editDataAccountBtn = document.querySelector(".containerGeneralForm__containerBtns--btnUpdateData")
    const deleteAccountBtn = document.querySelector(".containerGeneralForm__containerBtns--btnDeleteAccount")

    editDataAccountBtn.classList.add("noShow")
    deleteAccountBtn.classList.add("noShow")
    
    let saveDataBtn = document.querySelector(".containerGeneralForm__containerBtns--saveDataAccount")
       
    if(saveDataBtn){
        saveDataBtn.classList.remove("noShow")
        return;
    }

    if(!saveDataBtn){
         //Creacion del btn para guardar los datos a actualizar
        saveDataBtn = createBtn(
        containerBtnsOptionsUser, 
        "containerGeneralForm__containerBtns--saveDataAccount", 
        "Guardar datos", 
        ["fa-solid", "fa-floppy-disk"],)
        
    /*Incorporacion de evento para que el btn saveDataBtn guarde los datos actualizados dentro
    del localStorage */ 
    saveDataBtn.addEventListener("click", (e) => {
        e.preventDefault()
        //Valores nuevos de los inputs
        const valueNameInput = document.querySelector(".containerGeneralForm__containerDatauser--inputNameValue").value
        const valueLastNameInput = document.querySelector(".containerGeneralForm__containerDatauser--inputLastNameValue").value
        const valueInputEmail = document.querySelector(".containerGeneralForm__containerDatauser--inputEmailValue").value

        //Verificar que el usuario meta un correo valido
        const emailValidation = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        //Array completo de usuarios
        const usersArray = JSON.parse(localStorage.getItem("users")) || [];
        const userEmailActiveSession = JSON.parse(localStorage.getItem("Sesion activa"));

        if(valueNameInput.trim() === "" || valueLastNameInput.trim() === "" || valueInputEmail.trim() === "" ) {
            alert("No se pueden dejar campos vacios, porfavor llene los campos faltantes");
            return;
        }

        if(!emailValidation.test(valueInputEmail)){
            alert("Debes de ingresa un correo electronico valido")
            return;
        }

        if(valueInputEmail !== userEmailActiveSession){
            //Confirmar si el correo ingresado es igual a uno de los que ya existen en el array de usuarios
            const isEmailRegistered = usersArray.some(user => user.email ===  valueInputEmail)

            //Si el usuario mete un correo que ya existe le suelta el alert de que debe de utilizar otro
            if(isEmailRegistered){
                alert("Ese correo electronico ya esta en uso, utilice otro por favor.")
                return;
        } 
    }

        // Obtener sesión activa y usuarios registrados
        const userEmail = JSON.parse(localStorage.getItem("Sesion activa"));
        const users = JSON.parse(localStorage.getItem("users"));    

        //Encontrar dentro del array de usuarios al usaurio con la sesion activa
        const userIndex = users.findIndex(user => user.email === userEmail)

        if(userIndex !== -1){
            //Se cambian los datos
            users[userIndex].name = valueNameInput
            users[userIndex].lastName = valueLastNameInput
            users[userIndex].email = valueInputEmail

            /*Se vuelven a meter dentro del local storage los datos actualizados,
            asi como el correo con la sesion activa*/
            localStorage.setItem("users", JSON.stringify(users));
            localStorage.setItem("Sesion activa", JSON.stringify(valueInputEmail));
            
            //Mensaje de confirmacion de datos actualizados
            setTimeout(() => {
                createAlert(
                body,
                ["fa-solid", "fa-check-circle"],    
                "Datos actualizados",                  
                "Tus datos se han actualizado correctamente.",  
                "btnConfirm",                        
                "Aceptar",                        
                ["fa-solid", "fa-check"],
                true)

             setTimeout(() => {
                const btnAcept = document.querySelector(".btnConfirm");
                const btnCloseAlert = document.querySelector(".iconCloseAlert");

                [btnCloseAlert, btnAcept].forEach(btn => {
                    btn.addEventListener("click", () => {
                    saveDataBtn.classList.add("noShow");
                    editDataAccountBtn.classList.remove("noShow");
                    deleteAccountBtn.classList.remove("noShow");
                });
            });
    }, 175);
}, 150)

        }else{
            //Mensaje de que algo fallo
            createAlert(
                body,
                ["fa-solid", "fa-user-slash"],    
                "Usuario no encontrado",             
                "No se ha podido encontrar al usuario. Verifica tus datos.", 
                "btn-close",                        
                "Cerrar",                           
                ["fa-solid", "fa-times-circle"])      
            }
        })
    }
}

//Borrar cuenta permanentemente
const deleteAccount = () => {
    createAlert(
        body,
        ["fa-solid", "fa-triangle-exclamation"],    
        "¿Estás seguro de eliminar tu cuenta?",             
        "Esta acción eliminará tu cuenta de forma permanente y no podrá deshacerse. Todos tus datos serán eliminados. ¿Deseas continuar?", 
        "btnConfirmDeleteAccount",                        
        "Aceptar",                           
        ["fa-solid", "fa-check"],
        true)     
        
    const btnConfirmDeleteAccount = document.querySelector(".btnConfirmDeleteAccount")
    
    btnConfirmDeleteAccount.addEventListener("click",  () => {
    const userEmail = JSON.parse(localStorage.getItem("Sesion activa"));
    const users = JSON.parse(localStorage.getItem("users")) || [];
   

    //Encontrar dentro del array de usuarios al usaurio con la sesion activa
    const userIndex = users.findIndex(user => user.email === userEmail)

    if(userIndex !== -1){    

        users.splice(userIndex, 1)
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.removeItem("Sesion activa")
    
        const centerallContainer = document.querySelector(".centerAll")

        setTimeout(() => {
            createMessage(
                centerallContainer, 
                ["fa-solid", "fa-user-slash"], 
                "Cuenta borrada con éxito", 
                "En breve será redirigido a la página principal")

        setTimeout(() => {
            window.location.href = "index.html"
        }, 4000)
        
        },350)
    }else{
        createAlert(
            body,
            ["fa-solid", "fa-exclamation-triangle"],
            "Error al eliminar cuenta",               
            "La cuenta no se ha podido eliminar, intente de nuevo.",
            "btn-error",                                
            "Aceptar",                                 
            ["fa-solid", "fa-times"])
    }
    })
}

document.addEventListener("DOMContentLoaded", async () => {
    // Solo ejecuta esta lógica si estás en la página principal
    if (document.querySelector(".gridShows")) {
            const {
                notableShows,
                actionShows,
                comedyShows,
                scienceFictionShows,
                dramaShows,
                thrillerShows
            } = await loadCards();

            detectClick(notableShows, "notables");
            detectClick(actionShows, "accion");
            detectClick(comedyShows, "comedy");
            detectClick(scienceFictionShows, "cienciaFiccion");
            detectClick(dramaShows, "drama");
            detectClick(thrillerShows, "thrillers");
    }

    // Ejecutar checkAccount solo si existe el formulario de login
    if (document.getElementById("loginPage")) {
        checkAccount();
    }

    // Ejecutar createAccount solo si existe el formulario para crear una cuenta
    if (document.getElementById("createAccountPage")) {
        createAccount();
    }

    //Agregar btn de cerrar sesion en el asideUser si existe una seson activa
    if(localStorage.getItem("Sesion activa")){
        const containerOptionsUser = document.querySelector(".asideUser__containerOptions")
        let btnCloseAccount = document.querySelector(".closeAccount")

        if(containerOptionsUser){
            
        if(!btnCloseAccount){
            btnCloseAccount = document.createElement("p")
            btnCloseAccount.classList.add("asideUser__containerOptions--option",  "link",  "closeAccount")
            btnCloseAccount.textContent = "Cerrar sesion"

            containerOptionsUser.appendChild(btnCloseAccount)
        }
        }
    }

    //Ver datos registrados del usuario, editar datos o borrar cuenta
    if(document.getElementById("dataAccount") && localStorage.getItem("Sesion activa") ){
        //Ejecuta la funcion para ver los datos del usuario con la sesion activa
        showUserData()
        //Form
        const dataAccountForm = document.querySelector(".containerGeneralForm__form")

        dataAccountForm.addEventListener("click", (e) => {
            //Cambiar datos del usuario
            if(e.target.classList.contains("containerGeneralForm__containerBtns--btnUpdateData")){
                e.preventDefault()
                updateData()
            }
            //Eliminar cuenta
             if(e.target.classList.contains("containerGeneralForm__containerBtns--btnDeleteAccount")){
                e.preventDefault()
                deleteAccount()
            }
        })
    }

    //Pagina de favoritos
    if(document.querySelector(".titleFavorites")){
        const gridFavorites = document.querySelector(".gridFavorites")
    
        if(!localStorage.getItem("Sesion activa")){
            gridFavorites.classList.add("noFavoritesAdded")
            createMessage(gridFavorites, 
                ["fas", "fa-meh"],
                "Ups, parece que no tienes una sesion activa",
                "Necesitas una cuenta para poder ver tus favoritos")
            return;
        }

        const userEmail = JSON.parse(localStorage.getItem("Sesion activa"));
        const users = JSON.parse(localStorage.getItem("users")) || []; 
        const findUserActiveSession = users.find(user => user.email === userEmail)

        if(findUserActiveSession.favorites.length > 0){
            createFavoritesCard(findUserActiveSession.favorites)
            optionsFavorites()
        }else{
            gridFavorites.classList.add("noFavoritesAdded")
                createMessage(
                    gridFavorites, 
                    ["fas", "fa-meh"],
                    "Ups, parece que no hay shows agregados a favoritos ",
                    "Agrega shows a favoritos desde la pagina principal"
                )
        }
    }
});