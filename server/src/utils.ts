// Helper function to safely serialize objects
export const safeSerialize = (obj: any) => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error('Serialization error:', error);
    return {};
  }
};
