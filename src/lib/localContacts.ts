// Local storage for emergency contacts

export interface EmergencyContact {
  id: string;
  username: string;
  name: string;
  relation: string;
  phone: string;
}

const CONTACTS_KEY = 'disasterready_contacts';

// Helper function to get all contacts
const getContacts = (): EmergencyContact[] => {
  const contactsJson = localStorage.getItem(CONTACTS_KEY);
  return contactsJson ? JSON.parse(contactsJson) : [];
};

// Helper function to save contacts
const saveContacts = (contacts: EmergencyContact[]): void => {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
};

// Get contacts for a specific user
export const getUserContacts = (username: string): EmergencyContact[] => {
  const contacts = getContacts();
  return contacts.filter(c => c.username === username);
};

// Add a new contact
export const addContact = (username: string, name: string, relation: string, phone: string): EmergencyContact => {
  const contacts = getContacts();
  const newContact: EmergencyContact = {
    id: crypto.randomUUID(),
    username,
    name,
    relation,
    phone,
  };
  contacts.push(newContact);
  saveContacts(contacts);
  return newContact;
};

// Update a contact
export const updateContact = (contactId: string, name: string, relation: string, phone: string): boolean => {
  const contacts = getContacts();
  const index = contacts.findIndex(c => c.id === contactId);
  
  if (index === -1) return false;
  
  contacts[index] = {
    ...contacts[index],
    name,
    relation,
    phone,
  };
  
  saveContacts(contacts);
  return true;
};

// Delete a contact
export const deleteContact = (contactId: string): boolean => {
  const contacts = getContacts();
  const filteredContacts = contacts.filter(c => c.id !== contactId);
  
  if (filteredContacts.length === contacts.length) return false;
  
  saveContacts(filteredContacts);
  return true;
};
