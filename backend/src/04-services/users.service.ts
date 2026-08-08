import * as usersRepository from "../05-repository/users.repository.js";

export const updatePersonalization = async (userId: number, allows: boolean) => {
  return await usersRepository.updatePersonalization(userId, allows);
};

export const getPersonalization = async (userId: number) => {
  return await usersRepository.getPersonalizationPreference(userId);
};
