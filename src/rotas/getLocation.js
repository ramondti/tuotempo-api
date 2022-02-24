import knex from "../database/db";

export async function get_location(){
  const result = await knex.raw(`
  SELECT DISTINCT (agenda_central.cd_unidade_atendimento),
  unidade_atendimento.ds_unidade_atendimento,
  multi_empresas.nr_cep,
  multi_empresas.nm_bairro,
  cidade.nm_cidade,
  multi_empresas.nr_endereco,
  multi_empresas.ds_endereco,
  multi_empresas.cd_uf,
  multi_empresas.nr_telefone_empresa,
  'PHYSICAL' Tipo  
  FROM dbamv.agenda_central
  LEFT JOIN dbamv.multi_empresas ON multi_empresas.cd_multi_empresa= agenda_central.cd_multi_empresa
  LEFT JOIN dbamv.unidade_atendimento ON unidade_atendimento.cd_unidade_atendimento= agenda_central.cd_unidade_atendimento
  LEFT JOIN dbamv.cidade ON cidade.cd_cidade= multi_empresas.cd_cidade`
    );

    if (!result || result.length === 0) {
      return (`Não encontrou nenhum registro no banco`)
    }

    const dados = []
    result.forEach(element => {
      dados.push({
            location_lid: element.CD_UNIDADE_ATENDIMENTO,
             name: element.DS_UNIDADE_ATENDIMENTO,
             address: {
                 street_number: element.NR_ENDERECO,
                 street: element.DS_ENDERECO,
                 zipcode: element.NR_CEP
             }
  
   })
  })



    return {result: "OK", return: (dados)};
}

export async function get_location_id(location_lid){
  const result = await knex.raw(`
  SELECT DISTINCT (agenda_central.cd_unidade_atendimento),
  unidade_atendimento.ds_unidade_atendimento,
  multi_empresas.nr_cep,
  multi_empresas.nm_bairro,
  cidade.nm_cidade,
  multi_empresas.nr_endereco,
  multi_empresas.ds_endereco,
  multi_empresas.cd_uf,
  multi_empresas.nr_telefone_empresa,
  'PHYSICAL' Tipo  
  FROM dbamv.agenda_central
  LEFT JOIN dbamv.multi_empresas ON multi_empresas.cd_multi_empresa= agenda_central.cd_multi_empresa
  LEFT JOIN dbamv.unidade_atendimento ON unidade_atendimento.cd_unidade_atendimento= agenda_central.cd_unidade_atendimento
  LEFT JOIN dbamv.cidade ON cidade.cd_cidade= multi_empresas.cd_cidade
  where agenda_central.cd_unidade_atendimento = ${location_lid} `
    );

    if (!result || result.length === 0) {
      return (`Não encontrou nenhum registro no banco`)
    }

    const dados = []
    result.forEach(element => {
      dados.push({
            location_lid: element.CD_UNIDADE_ATENDIMENTO,
             name: element.DS_UNIDADE_ATENDIMENTO,
             address: {
                 street_number: element.NR_ENDERECO,
                 street: element.DS_ENDERECO,
                 zipcode: element.NR_CEP
             }
  
   })
  })
  




    return {result: "OK", return: (dados)};
}

export { get_location };
export { get_location_id };

