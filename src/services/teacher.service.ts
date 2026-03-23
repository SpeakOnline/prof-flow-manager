/**
 * Teacher Service
 *
 * Serviço para operações CRUD de professores no Supabase.
 * Centraliza toda a lógica de acesso a dados de professores.
 */

import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Teacher = Database['public']['Tables']['teachers']['Row'];
type TeacherInsert = Database['public']['Tables']['teachers']['Insert'];
type TeacherUpdate = Database['public']['Tables']['teachers']['Update'];

/**
 * Busca todos os professores
 *
 * @returns Lista de professores ordenada por nome
 * @throws Error se falhar ao buscar
 */
export async function getAllTeachers(): Promise<Teacher[]> {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching teachers:', error);
    throw new Error('Erro ao buscar professores');
  }

  return data || [];
}

/**
 * Busca um professor por ID
 *
 * @param id - ID do professor
 * @returns Dados do professor
 * @throws Error se professor não encontrado
 */
export async function getTeacherById(id: string): Promise<Teacher> {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching teacher:', error);
    throw new Error('Professor não encontrado');
  }

  return data;
}

/**
 * Busca um professor pelo user_id (ID do auth.users)
 *
 * @param userId - ID do usuário (auth.users)
 * @returns Dados do professor ou null se não encontrado
 */
export async function getTeacherByUserId(userId: string): Promise<Teacher | null> {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Não encontrado
      return null;
    }
    console.error('Error fetching teacher by user_id:', error);
    return null;
  }

  return data;
}

/**
 * Garante que exista um registro na tabela teachers para o usuário informado.
 * Se já existir, retorna o registro existente.
 *
 * @param userId - ID do usuário (auth.users)
 * @param name - Nome para cadastro inicial
 * @param email - E-mail para cadastro inicial
 * @returns Dados do professor existente ou criado
 */
export async function ensureTeacherProfileForUser(
  userId: string,
  name: string,
  email: string
): Promise<Teacher> {
  const existingTeacher = await getTeacherByUserId(userId);
  if (existingTeacher) {
    return existingTeacher;
  }

  const { data, error } = await supabase
    .from('teachers')
    .insert({
      user_id: userId,
      name,
      email,
      level: 'intermediario',
      has_international_certification: false,
    })
    .select('*')
    .single();

  if (error) {
    // Em caso de corrida, tenta buscar novamente o registro criado por outra requisição
    const teacherAfterError = await getTeacherByUserId(userId);
    if (teacherAfterError) {
      return teacherAfterError;
    }

    console.error('Error ensuring teacher profile:', error);
    throw new Error('Nao foi possivel preparar agenda para este usuario');
  }

  return data;
}

/**
 * Busca professores por nível de proficiência
 *
 * @param level - Nível de proficiência
 * @returns Lista de professores do nível especificado
 */
export async function getTeachersByLevel(
  level: 'iniciante' | 'intermediario' | 'avancado' | 'nativo'
): Promise<Teacher[]> {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('level', level)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching teachers by level:', error);
    throw new Error('Erro ao buscar professores por nível');
  }

  return data || [];
}

/**
 * Busca professores com certificação internacional
 *
 * @returns Lista de professores certificados
 */
export async function getCertifiedTeachers(): Promise<Teacher[]> {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('has_international_certification', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching certified teachers:', error);
    throw new Error('Erro ao buscar professores certificados');
  }

  return data || [];
}

/**
 * Busca professores por termo de busca (nome ou email)
 *
 * @param searchTerm - Termo de busca
 * @returns Lista de professores que correspondem à busca
 */
export async function searchTeachers(searchTerm: string): Promise<Teacher[]> {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error searching teachers:', error);
    throw new Error('Erro ao buscar professores');
  }

  return data || [];
}

/**
 * Cria um novo professor
 *
 * @param teacher - Dados do professor
 * @returns Professor criado
 * @throws Error se falhar ao criar
 */
export async function createTeacher(teacher: TeacherInsert): Promise<Teacher> {
  const { data, error } = await supabase
    .from('teachers')
    .insert(teacher)
    .select()
    .single();

  if (error) {
    console.error('Error creating teacher:', error);
    throw new Error('Erro ao criar professor');
  }

  return data;
}

/**
 * Atualiza dados de um professor
 *
 * @param id - ID do professor
 * @param updates - Dados a atualizar
 * @returns Professor atualizado
 * @throws Error se falhar ao atualizar
 */
export async function updateTeacher(
  id: string,
  updates: TeacherUpdate
): Promise<Teacher> {
  const { data, error } = await supabase
    .from('teachers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating teacher:', error);
    throw new Error('Erro ao atualizar professor');
  }

  return data;
}

/**
 * Atualiza último acesso ao horário do professor
 *
 * @param userId - ID do usuário (auth.users)
 */
export async function updateLastScheduleAccess(userId: string): Promise<void> {
  const { error } = await supabase
    .from('teachers')
    .update({ last_schedule_access: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating last access:', error);
    // Não lança erro pois é operação auxiliar
  }
}

/**
 * Deleta um professor
 *
 * @param id - ID do professor
 * @throws Error se falhar ao deletar
 */
export async function deleteTeacher(id: string): Promise<void> {
  const { error } = await supabase.from('teachers').delete().eq('id', id);

  if (error) {
    console.error('Error deleting teacher:', error);
    throw new Error('Erro ao deletar professor');
  }
}
