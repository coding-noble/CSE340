const pool = require("../database");

/***********************
 * Get all Recipients
 ***********************/
async function getRecipients() {
    return await pool.query(
        "SELECT * FROM public.account ORDER BY account_id"
    );
}

/***********************
 * Get Message by ID
 ***********************/
async function getMessageById(message_id) {
    return await pool.query(
        "SELECT * FROM public.message JOIN public.account ON public.message.message_from = public.account.account_id WHERE message_id = $1", [message_id]
    );
}

/***********************
 * Send Message
 ***********************/
async function sendMessage(new_message_sender, new_message_recipient, new_message_subject, new_message_content) {
    return await pool.query(
        "INSERT INTO public.message (message_subject, message_body, message_to, message_from) VALUES ($1, $2, $3, $4)", [new_message_subject, new_message_content, new_message_recipient, new_message_sender]
    );
}

/***********************
 * Get Inbox by account ID
 ***********************/
async function getInboxByAccountId(account_id) {
    return await pool.query("SELECT * FROM public.message JOIN public.account ON public.message.message_from = public.account.account_id WHERE message_to = $1", [account_id]);
}

async function toggleRead(message_id) {
    return await pool.query("UPDATE public.message SET message_read = NOT message_read WHERE message_id = $1", [message_id])
}

async function toggleArchive(message_id) {
    return await pool.query("UPDATE public.message SET message_archived = NOT message_archived WHERE message_id = $1", [message_id])
}

async function deleteMessage(message_id) {
    return await pool.query("DELETE FROM public.message WHERE message_id = $1", [message_id])
}

async function getUnreadCount(account_id) {
    return (await pool.query("SELECT COUNT(*) FROM public.message WHERE message_to = $1 AND message_read = false", [account_id])).rows[0].count;
}

async function getArchivedCount(account_id) {
    return (await pool.query("SELECT COUNT(*) FROM public.message WHERE message_to = $1 AND message_archived = true", [account_id])).rows[0].count;
}

module.exports = { getRecipients, getMessageById, sendMessage, getInboxByAccountId, toggleRead, toggleArchive, deleteMessage, getUnreadCount, getArchivedCount }