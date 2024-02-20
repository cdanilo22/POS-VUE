import {ref, computed} from 'vue'
import { uid } from 'uid'
import {useFirebaseStorage} from 'vuefire'
import {ref as storageRef, uploadBytesResumable, getDownloadURL} from 'firebase/storage'


export default function useImage() {
   
    const url = ref(null)
    const storage = useFirebaseStorage() //así poder conectarnos al servicio de firebase Storage

    
    const onFileChange = e => {
        const file = e.target.files[0]
        const filename = uid() + '.jpg' //generamos el nombre del archivo aleatorio para que no se repita
        const sRef = storageRef(storage, '/products/' + filename) // Ubicación donde se van almacenar las imagenes


        //Sube el archivo
        const uploadTask = uploadBytesResumable(sRef, file)

        uploadTask.on('state_changed',
            () => {},
            (error) =>  console.log(error),
            () => {
                //La imagen ya se subió
                getDownloadURL(uploadTask.snapshot.ref)

                .then( (downloadURL)=>{ //Se genera la URL donde se encuentra almacenada la imagen
                    url.value = downloadURL  //en dado que se suna la imagen se va a llenar el state url 
                })
            }

        ) //Cuando la imagen ya se comienza a subir
    
    }

    const isImageUploaded = computed(() => {
        return url.value ? url.value : null 
    })
    return {
        url,
        onFileChange,
        isImageUploaded
    }
}