const pb = new PocketBase('https://fungallerytags.pockethost.io/')
export let currentUserID = "false"

export async function PBlogin() {

    try {
        await pb.collection("users").authWithPassword('alex.wervik@outlook.com', "Rapetstraat")
        currentUserID = pb.authStore.record.id
        console.log(currentUserID)
        

        PBmakeallcollections()
    } catch {
        currentUserID = "false"

    }


}


export async function PBcheckloginstatus() {
    if (currentUserID == "false") {
        return "false"
    } else {
        return "true"
    }
}
export async function PBupdateUX() {
    const folderbtn = document.getElementById("fileInputLabel")

    if (currentUserID == "false"){
        folderbtn.style.display = "none"
    } else {
        folderbtn.style.display = "block"
    }
}
export async function PBmakeallcollections() {
    //check if fave collection exist for user if not create one 
    try {
        const record = await pb.collection('fave').getFirstListItem(`user="${currentUserID}"`)
        console.log(record)

    } catch {
        const data = {
            "user": `${currentUserID}`,
            "listfield": ""
        }
        const record = await pb.collection('fave').create(data)
    }

    //check if hate collection exist for user if not create one 
    try {
        const record = await pb.collection('hate').getFirstListItem(`user="${currentUserID}"`)
        console.log(record)

    } catch {
        const data = {
            "user": `${currentUserID}`,
            "listfield": ""
        }
        const record = await pb.collection('hate').create(data)
    }
}
export async function PBsavetolist(listname, list){
    const data = {
        "user": `${currentUserID}`,
        "listfield": `${list}`
    }
    const recordID = await pb.collection('hate').getFirstListItem(`user="${currentUserID}"`).id
    const record = await pb.collection(`${listname}`).update(`${recordID}`, data)
}