import knex from '../database/db';

export async function get_insurances() {
  try {
    const result = await knex.raw(`
  SELECT 
  cd_convenio, 
  nm_convenio
 FROM dbamv.convenio 
 WHERE sn_ativo = 'S'
 order by 1 asc
`);

    if (!result || result.length === 0) {
      return {
        result: 'ERROR',
        debug_msg: 'Não encontrado registro no banco de dados',
      };
    }

    const dados = [];
    result.forEach(element => {
      dados.push({
        location_lid: element.CD_CONVENIO,
        name: element.NM_CONVENIO,
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

export { get_insurances };
