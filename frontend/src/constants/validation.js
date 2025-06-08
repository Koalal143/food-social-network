export const BANNED_USERNAMES = [
    "admin",
    "administrator",
    "root",
    "moderator",
    "support",
    "help",
    "owner",
    "staff",
    "avatar",
    "me",
];

export const BANNED_USERNAME_REGEX = new RegExp(
    BANNED_USERNAMES.map(name => `(${name})`).join('|'),
    'i'
);

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const PASSWORD_MIN_LENGTH = 8;

export const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;