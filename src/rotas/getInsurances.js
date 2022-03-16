import knex from '../database/db';

export async function get_insurances() {
  try {
    const result = await knex.raw(`
    SELECT
    convenio.cd_convenio || '-' || con_pla.cd_con_pla cd_convenio,
    convenio.nm_convenio || ' - ' || con_pla.ds_con_pla nm_convenio  
    FROM dbamv.convenio
    LEFT JOIN con_pla ON con_pla.cd_convenio = convenio.cd_convenio  
    WHERE convenio.sn_ativo = 'S'
    order by 1 ASC 
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
        insurance_lid: element.CD_CONVENIO,
        name: element.NM_CONVENIO,
        patient_notice: {
          text: null,
          show: 'true'
        },
        preparation: null,
        web_enabled: 'true',
        active: 'true'
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
