/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
import { auth, db, storage } from './firebase.js';
import {
  login,
  registerUser,
  logout,
  postCreate,
  likeAdd,
  likeRemove,
  likeToggle,
  postRemove,
  postEdit,
  loginWithGoogle,
  loginWithGithub,
} from './utils.js';

// Función para iniciar sesión con Firebase

// Función para registrar un nuevo usuario en Firebase
function register(email, password, displayName) {
  return registerUser(email, password)
  // Registra un nuevo usuario utilizando el correo electrónico y la contraseña proporcionados

    // Se ejecuta cuando la promesa de registro se resuelve con éxito
    .then((userCredential) => {
      const user = userCredential.user; // Obtiene el usuario desde el objeto userCredential
      // Actualiza el perfil del usuario con el nombre a mostrar proporcionado
      return user.updateProfile({
        displayName,
        // Se ejecuta cuando la promesa de actualización de perfil se resuelve con éxito
      }).then(() => {
        renderApp(user); // medotdo creado para renderizar la aplicación con el usuario actualizado
      });
    });
}
// Función para crear una publicación
function createPost(user, text, imageFile) {
  // Crear un objeto post con los datos de la publicación
  const post = {
    userId: user.uid, // ID del usuario que realiza la publicación
    username: user.displayName, // Nombre del usuario que realiza la publicación
    text, // Texto de la publicación
    likes: [], // Campo para almacenar los likes (inicialmente vacío)
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    // Marca de tiempo de la publicación
  };
    // Agregar el post a la colección 'posts' en la base de datos
  return postCreate()
    .add(post)
    .then((docRef) => {
      // Si se proporciona una imagen, se realiza el proceso de subir la imagen a Firebase Storage
      // y obtener la URL de descarga
      if (imageFile) {
        const imagePath = `posts/${docRef.id}/${imageFile.name}`; // Ruta de almacenamiento de la imagen en Storage
        return (
          storage
            .ref()
            .child(imagePath) // obtener la referencia de la imagen dentro del directorio
          // imagePath es la ruta de almacenamiento de la imagen en Firebase Storage
            .put(imageFile) // Subir la imagen al Storage
            .then(() => storage.ref().child(imagePath).getDownloadURL())
            // Obtener la URL de descarga de la imagen
            .then((imageUrl) => db.collection('posts').doc(docRef.id).update({ imageUrl }))
            // Actualizar el documento de la publicación en la colección
            // 'posts' con la URL de la imagen
        );
      }
      return docRef; // then() asegurar de que haya una declaración de retorno.por la funcion =>
    });
}

// pendiente acerca cambio de estado de autenticación de Firebase inicio de sesion o cierre etc
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

  // El usuario ha iniciado sesión, este if se crea para garantizar que el usuario
  // inicio sesion y actualice el nombre en la vista de publicaciones
  if (user) {
    // se crea una porcion del HTML que corresponde al menu de publicaciones
    root.innerHTML = `   
        <div>
        <ul class="navbar">
      
        <li style="float:right"><a class="nav-link logged-in" "><button id="logoutBtn">Cerrar sesión</button></a></li>
      </ul>
          <h1>Bienvenido, ${user.displayName}</h1>
        </div>
      <div>
     
      
        <h2>Crear publicación</h2>
        <textarea id="postText" placeholder="Escribe tu mensaje"></textarea> 
      <p> <input type="file" id="postImage" class="selectFile" ></p>

     <button id="createPostBtn">Publicar</button>
      </div>
      <div id="postsContainer"></div>
    `;
  } else {
    // el usuario no ha iniciado sesion
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

  // Obtener las publicaciones ordenadas por su marca de tiempo de forma descendente y escuchar
  // los cambios en tiempo real
  db.collection('posts')
    .orderBy('timestamp', 'desc')
    .onSnapshot((querySnapshot) => {
      // Limpiar el contenedor de publicaciones antes de agregar las nuevas
      postsContainer.innerHTML = '';

      // Recorrer cada documento en la colección de publicaciones
      querySnapshot.forEach((doc) => {
        const post = doc.data();
        const postElement = document.createElement('div');
        postElement.id = 'post-element';
        const postId = doc.id;
        const likeBtn = document.createElement('button');
        const likeCount = document.createElement('span');

        // Verificar si el usuario actual ya dio like a la publicación
        if (post.likes.includes(user.uid)) {
          likeBtn.textContent = 'Quitar like';
        } else {
          likeBtn.textContent = 'Me gusta';
        }
        // Función para quitar un like de una publicación
        function removeLike(postId, userId) {
          return likeRemove()
            .doc(postId)
            .update({
              likes: firebase.firestore.FieldValue.arrayRemove(userId),
            })
            .catch((error) => {
              console.log('Error quitando like:', error);
            });
        }

        // Función para agregar un like a una publicación
        function addLike(postId, userId) {
          return likeAdd()
            .doc(postId)
            .update({
              likes: firebase.firestore.FieldValue.arrayUnion(userId),
            })
            .catch((error) => {
              console.log('Error agregando like:', error);
            });
        }
        // Función para cambiar el estado de like (agregar/quitar) de una publicación
        // eslint-disable-next-line no-shadow
        function toggleLike(postId, userId) {
          return likeToggle()
            .doc(postId)
            .get()
            .then((doc) => {
              const post = doc.data();
              if (post.likes.includes(userId)) {
              // El usuario hizo la publicación, se permite quitar el like
                removeLike(postId, userId);
              } else {
                addLike(postId, userId);
              // El usuario no hizo la publicación, se permite agregar/quitar el like
              }
            })
            .catch((error) => {
              console.log('Error toggling like:', error);
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
        // Agregar el botón de "Me gusta" al elemento postElement
        postElement.appendChild(likeBtn);

        // Agregar el contador de "Me gusta" al elemento postElement
        postElement.appendChild(likeCount);
        // Si la publicación tiene una URL de imagen, crear un elemento de imagen y agregarlo
        // al elemento de la publicación
        if (post.imageUrl) {
          const imgElement = document.createElement('img');
          imgElement.src = post.imageUrl;
          postElement.appendChild(imgElement);
        }
        // Agregar el elemento de la publicación al contenedor de publicaciones
        postsContainer.appendChild(postElement);

        // Verificar si el usuario actual es el creador del post
        if (post.userId === user.uid) {
          const editBtn = document.createElement('button');
          editBtn.textContent = 'Editar';
          editBtn.classList.add('edit-button');
          // Agregar el evento click al botón de editar para editar la publicación
          editBtn.addEventListener('click', () => {
            editPost(postId, postElement);
          });
          // Agregar el botón de editar al elemento postElement
          postElement.appendChild(editBtn);
        }

        // Verificar si el usuario actual es el creador del post
        if (post.userId === user.uid) {
          const removeBtn = document.createElement('button');
          removeBtn.textContent = 'Eliminar';
          removeBtn.classList.add('delete-button');

          // Agregar el evento click al botón de eliminar para eliminar la publicación
          removeBtn.addEventListener('click', () => {
            removePost(postId);
          });

          // Agregar el botón de eliminar al elemento postElement
          postElement.appendChild(removeBtn);
        }
        function editPost(postIdLocal) {
          return postEdit(postIdLocal)
            .get()
            .then((doc) => {
              if (doc.exists) {
                const currentText = doc.data().text;
                const newText = prompt('Edit the post:', currentText);

                if (newText !== null) {
                  return postEdit(postIdLocal)
                    .update({ text: newText }) // Update the 'text' field of the post document
                    .then(() => {
                      console.log('Publicación editada correctamente');
                    })
                    .catch((error) => {
                      console.error('Error al editar la publicación: ', error);
                      throw error;
                    });
                }
              } else {
                console.log('La publicacion no existe');
              }
            })
            .catch((error) => {
              console.error('Error al obtener la publicación: ', error);
              throw error;
            });
        }
        // crear eliminar
        function removePost(postId) {
          return postRemove(postId)
            .get()
            .then((doc) => {
              if (doc.exists) {
                // Verificar si el usuario actual es el creador del post
                if (doc.data().userId === user.uid) {
                  // Mostrar ventana modal de confirmación

                  const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar esta publicación?');
                  if (confirmDelete) {
                    // El usuario es el creador, se permite eliminar el post
                    return postRemove(postId)
                      .delete()
                      .then(() => {
                        console.log('Publicación eliminada correctamente');
                      // realizar cualquier acción adicional después de eliminar la publicación
                      })
                      .catch((error) => {
                        console.log('Error eliminando la publicación:', error);
                      });
                  }
                } else {
                  console.log('No tienes permisos para eliminar esta publicación');
                }
              } else {
                console.log('La publicación no existe');
              }
            })
            .catch((error) => {
              console.log('Error obteniendo la publicación:', error);
            });
        }
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
        <button id="googleBtn">Google sesión</button>
        <button id="githubBtn">Github sesión</button>
        <p>¿No tienes una cuenta? <a href="#" id="registerLink">Regístrate</a></p>
      </div>
    `;
  // INICIO CON GOOGLE
  const googleButton = document.getElementById('googleBtn');
  googleButton.addEventListener('click', () => {
    loginWithGoogle() // FUNCION
      .then((credentials) => {
        console.log(credentials);
      })
      .catch((error) => {
        console.log(error);
      });
  });
  // INICIO CON GITHUB
  const githubButton = document.getElementById('githubBtn');
  githubButton.addEventListener('click', () => {
    loginWithGithub()
      .then((credentials) => {
        console.log(credentials);
      })
      .catch((error) => {
        console.log(error);
      });
  });
  // INICIO CON LOGIN
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

    // Llamar a la función de registro (register) con el correo electrónico,
    // contraseña y nombre a mostrar
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
