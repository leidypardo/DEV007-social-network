// Configura tu proyecto de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBNluBznjomyliyABn2oDwK7M9vrviwo4Y",
    authDomain: "redsocial134679.firebaseapp.com",
    projectId: "redsocial134679",
    storageBucket: "redsocial134679.appspot.com",
    messagingSenderId: "25914351147",
    appId: "1:25914351147:web:b2c96f029eb6572265146e",
    measurementId: "G-7CRSTC4NPM"
  };
  
  // Inicializa Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth(); // llama del servicio de autenticación de Firebase
  const db = firebase.firestore(); // Instancia del servicio de Firestore de Firebase
  const storage = firebase.storage(); // Instancia del servicio de almacenamiento de Firebase
  
  // Función para iniciar sesión con Firebase
  function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password); // Realiza el inicio de sesión utilizando el correo electrónico y la contraseña proporcionados
  }
  
  // Función para registrar un nuevo usuario en Firebase
  function register(email, password, displayName) {
    return auth
      .createUserWithEmailAndPassword(email, password) // Registra un nuevo usuario utilizando el correo electrónico y la contraseña proporcionados
      .then((userCredential) => { // Se ejecuta cuando la promesa de registro se resuelve con éxito
        const user = userCredential.user; // Obtiene el usuario desde el objeto userCredential
        return user.updateProfile({ // Actualiza el perfil del usuario con el nombre a mostrar proporcionado
          displayName: displayName,
        }).then(() => { // Se ejecuta cuando la promesa de actualización de perfil se resuelve con éxito
          renderApp(user); // medotdo creado para renderizar la aplicación con el usuario actualizado
        });
      });
  }
  
  
  // Función para cerrar sesión con Firebase
  function logout() {
    return auth.signOut(); // Cierra la sesión del usuario actual
  }
  
  // Función para crear una publicación
  function createPost(user, text, imageFile) {
    // Crear un objeto post con los datos de la publicación
    const post = {
      userId: user.uid, // ID del usuario que realiza la publicación
      username: user.displayName, // Nombre del usuario que realiza la publicación
      text: text, // Texto de la publicación
      likes: [], // Campo para almacenar los likes (inicialmente vacío)
      timestamp: firebase.firestore.FieldValue.serverTimestamp(), // Marca de tiempo de la publicación
    };
  
    // Agregar el post a la colección 'posts' en la base de datos
    return db.collection('posts')
      .add(post)
      .then((docRef) => {
        // Si se proporciona una imagen, se realiza el proceso de subir la imagen a Firebase Storage y obtener la URL de descarga
        if (imageFile) {
          const imagePath = `posts/${docRef.id}/${imageFile.name}`; // Ruta de almacenamiento de la imagen en Storage
          return storage.ref()
            .child(imagePath) //obtener la referencia de la imagen dentro del directorio imagePath es la ruta de almacenamiento de la imagen en Firebase Storage
            .put(imageFile) // Subir la imagen al Storage
            .then(() => {
              return storage.ref().child(imagePath).getDownloadURL(); // Obtener la URL de descarga de la imagen
            })
            .then((imageUrl) => {
              // Actualizar el documento de la publicación en la colección 'posts' con la URL de la imagen
              return db.collection('posts').doc(docRef.id).update({
                imageUrl: imageUrl,
              });
            });
        }
      });
  }
  // esta pendiente de algun cambio de estado de autenticación de Firebase sea inicio de sesion o cierre etc
  auth.onAuthStateChanged((user) => {
    if (user) {
      // El usuario ha iniciado sesión
      renderApp(user);
    } else {
      // El usuario no ha iniciado sesión
      renderLogin();
    }
  });
  
  // Función para renderizar la aplicación
  function renderApp(user) {
    const root = document.getElementById('root');
  
    // El usuario ha iniciado sesión, este if se crea para garantizar que el usuario inicio sesion y actualice el nombre en la vista de publicaciones
    if (user) { 
      // se crea una porcion del HTML que corresponde al menu de publicaciones
      root.innerHTML = `   
        <div>
          <h1>Bienvenido, ${user.displayName}</h1>
        </div>
      <div>
      
         <button id="logoutBtn">Cerrar sesión</button>
       
        <h2>Crear publicación</h2>
        <textarea id="postText" placeholder="Escribe tu mensaje"></textarea>
        <input type="file" id="postImage">
        <button id="createPostBtn">Publicar</button>
      </div>
      <div id="postsContainer"></div>
    `;}else{
      //el usuario no ha iniciado sesion
      renderLogin();
    }
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
      logout();
    });
   // Obtener el botón de crear publicación
  const createPostBtn = document.getElementById('createPostBtn');
  
  // Agregar un evento de clic al botón de crear publicación
  createPostBtn.addEventListener('click', () => {
    // Obtener el texto y la imagen de la publicación ingresados por el usuario
    const postText = document.getElementById('postText').value;
    const postImage = document.getElementById('postImage').files[0];
  
    // Llamar a la función createPost para crear la publicación
    createPost(user, postText, postImage)
      .then(() => {
        // Limpiar los campos de texto e imagen después de crear la publicación exitosamente
        document.getElementById('postText').value = '';
        document.getElementById('postImage').value = '';
      })
      .catch((error) => {
        console.log('Error creating post:', error);
      });
  });
  
  // Obtener el contenedor de las publicaciones existentes
  const postsContainer = document.getElementById('postsContainer');
  
  // Obtener las publicaciones ordenadas por su marca de tiempo de forma descendente y escuchar los cambios en tiempo real
  db.collection('posts')
    .orderBy('timestamp', 'desc')
    .onSnapshot((querySnapshot) => {
      // Limpiar el contenedor de publicaciones antes de agregar las nuevas
      postsContainer.innerHTML = '';
  
      // Recorrer cada documento en la colección de publicaciones
      querySnapshot.forEach((doc) => {
        const post = doc.data();
        const postElement = document.createElement('div');
        const postId = doc.id;
        const likeBtn = document.createElement('button');
        const likeCount = document.createElement('span');
        
  
        // Verificar si el usuario actual ya dio like a la publicación
        if (post.likes.includes(user.uid)) {
          likeBtn.textContent = 'Quitar like';
        } else {
          likeBtn.textContent = 'Me gusta';
        }
  
        // Función para cambiar el estado de like (agregar/quitar) de una publicación
        function toggleLike(postId, userId) {
          db.collection('posts')
            .doc(postId)
            .get()
            .then((doc) => {
              const post = doc.data();
              if (post.userId === userId) {
                // El usuario hizo la publicación, se permite quitar el like
                removeLike(postId, userId);
              } else {
                // El usuario no hizo la publicación, se permite agregar/quitar el like
                if (post.likes.includes(userId)) {
                  removeLike(postId, userId);
                } else {
                  addLike(postId, userId);
                }
              }
            })
            .catch((error) => {
              console.log('Error toggling like:', error);
            });
        }
  
        // Función para agregar un like a una publicación
        function addLike(postId, userId) {
          db.collection('posts')
            .doc(postId)
            .update({
              likes: firebase.firestore.FieldValue.arrayUnion(userId),
            })
            .catch((error) => {
              console.log('Error agregando like:', error);
            });
        }
  
        // Función para quitar un like de una publicación
        function removeLike(postId, userId) {
          db.collection('posts')
            .doc(postId)
            .update({
              likes: firebase.firestore.FieldValue.arrayRemove(userId),
            })
            .catch((error) => {
              console.log('Error quitando like:', error);
            });
        }
  
        // Agregar el evento click al botón de like para cambiar su estado
        likeBtn.addEventListener('click', () => {
          toggleLike(postId, user.uid);
        });
  
        // Mostrar la cantidad de likes de la publicación
        likeCount.textContent = post.likes.length;
  
        // Agregar el contenido de la publicación al elemento postElement
        postElement.innerHTML = `
          <h3>${post.username}</h3>
          <p>${post.text}</p>
        `;
  
        // Si la publicación tiene una URL de imagen, crear un elemento de imagen y agregarlo al elemento de la publicación
        if (post.imageUrl) {
          const imgElement = document.createElement('img');
          imgElement.src = post.imageUrl;
          postElement.appendChild(imgElement);
        }
  
        // Agregar el elemento de la publicación, el botón de like y el contador de likes al contenedor de publicaciones
        postsContainer.appendChild(postElement);
        postElement.appendChild(likeBtn);
        postElement.appendChild(likeCount);
      });
    });
  
  }
  
  // Función para renderizar el formulario de inicio de sesión
  function renderLogin() {
    // Obtener el elemento root
    const root = document.getElementById('root');
  
    // Renderizar el formulario de inicio de sesión en el elemento root
    root.innerHTML = `
      <div class="login-container">
        <h1>Iniciar sesión</h1>
        <input type="email" id="emailInput" placeholder="Correo electrónico" required>
        <input type="password" id="passwordInput" placeholder="Contraseña" required>
        <button id="loginBtn">Iniciar sesión</button>
        <p>¿No tienes una cuenta? <a href="#" id="registerLink">Regístrate</a></p>
      </div>
    `;
  
    // Obtener el botón de inicio de sesión
    const loginBtn = document.getElementById('loginBtn');
  
    // Agregar un evento de clic al botón de inicio de sesión
    loginBtn.addEventListener('click', () => {
      // Obtener el correo electrónico y la contraseña ingresados por el usuario
      const email = document.getElementById('emailInput').value;
      const password = document.getElementById('passwordInput').value;
  
      // Llamar a la función de inicio de sesión (login) con el correo electrónico y la contraseña
      login(email, password)
        .catch((error) => {
          console.log('Error logging in:', error);
        });
    });
  
    // Obtener el enlace de registro
    const registerLink = document.getElementById('registerLink');
  
    // Agregar un evento de clic al enlace de registro
    registerLink.addEventListener('click', () => {
      // Renderizar el formulario de registro
      renderRegister();
    });
  }
  
  // Función para renderizar el formulario de registro
  function renderRegister() {
    // Obtener el elemento root
    const root = document.getElementById('root');
  
    // Renderizar el formulario de registro en el elemento root
    root.innerHTML = `
      <div class="login-container">
        <h1>Regístrate</h1>
        <input type="text" id="displayNameInput" placeholder="Nombre completo" required>
        <input type="email" id="emailInput" placeholder="Correo electrónico" required>
        <input type="password" id="passwordInput" placeholder="Contraseña" required>
        <button id="registerBtn">Registrar</button>
        <p>¿Ya tienes una cuenta? <a href="#" id="loginLink">Inicia sesión</a></p>
      </div>
    `;
  
    // Obtener el botón de registro
    const registerBtn = document.getElementById('registerBtn');
  
    // Agregar un evento de clic al botón de registro
    registerBtn.addEventListener('click', () => {
      // Obtener el nombre a mostrar, correo electrónico y contraseña ingresados por el usuario
      const displayName = document.getElementById('displayNameInput').value;
      const email = document.getElementById('emailInput').value;
      const password = document.getElementById('passwordInput').value;
  
      // Llamar a la función de registro (register) con el correo electrónico, contraseña y nombre a mostrar
      register(email, password, displayName)
        .catch((error) => {
          console.log('Error registering:', error);
        });
    });
  
    // Obtener el enlace de inicio de sesión
    const loginLink = document.getElementById('loginLink');
  
    // Agregar un evento de clic al enlace de inicio de sesión
    loginLink.addEventListener('click', () => {
      // Renderizar el formulario de inicio de sesión
      renderLogin();
    });
  }