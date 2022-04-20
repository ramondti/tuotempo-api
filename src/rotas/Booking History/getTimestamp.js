import knex from '../database/db';

export async function get_timestamp() {
  try {
    const result = await knex.raw(`

`);

    if (!result || result.length === 0) {
      return {
        result: 'OK'
      };
    }

    const dados = [];
    result.forEach(element => {
      dados.push({
      });
    });

    return { result: 'OK', return: dados };
  } catch (error) {
    console.log(error)
    return {
      result: 'ERROR',
      debug_msg: 'Erro ao consultar o banco de dados!'
    };
  }
}

export { get_timestamp };
