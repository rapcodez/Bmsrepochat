
// Hugging Face Service - Disabled/Stubbed to fix build errors
// The user requested to remove this service.

export const chatWithHF = async (query: string): Promise<string> => {
    return "Hugging Face integration has been disabled. Please use Groq or the Offline Mock engine.";
};

export const refreshHFClient = () => {
    return false;
};
