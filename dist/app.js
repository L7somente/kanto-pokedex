const grid=document.querySelector('#pokedex');
const search=document.querySelector('#search');
const typeFilter=document.querySelector('#typeFilter');
const sortSelect=document.querySelector('#sort');
const favoritesBtn=document.querySelector('#favoritesBtn');
const resultCount=document.querySelector('#resultCount');
const empty=document.querySelector('#empty');
const dialog=document.querySelector('#detailDialog');
const detailContent=document.querySelector('#detailContent');
let onlyFavorites=false;
let favorites=new Set(JSON.parse(localStorage.getItem('kanto-favorites')||'[]'));
let detailsCache=new Map();

const imageUrl=id=>`https://assets.pokemon.com/assets/cms2/img/pokedex/full/${String(id).padStart(3,'0')}.png`;
const pokemonById=id=>POKEMON.find(p=>p.id===Number(id));
const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

Object.entries(TYPE_LABELS).forEach(([value,label])=>typeFilter.insertAdjacentHTML('beforeend',`<option value="${value}">${label}</option>`));

function saveFavorites(){localStorage.setItem('kanto-favorites',JSON.stringify([...favorites]));document.querySelector('#caughtCount').textContent=favorites.size}
function typePills(types){return types.map(t=>`<span class="type-pill" style="--type-color:${TYPE_COLORS[t]}">${TYPE_LABELS[t]}</span>`).join('')}

function render(){
  const query=normalize(search.value.trim());
  let list=POKEMON.filter(p=>{
    const number=String(p.id).padStart(3,'0');
    return(!query||normalize(p.name).includes(query)||number.includes(query))&&(typeFilter.value==='all'||p.types.includes(typeFilter.value))&&(!onlyFavorites||favorites.has(p.id));
  });
  const sort=sortSelect.value;
  if(sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name));
  if(sort==='name-desc')list.sort((a,b)=>b.name.localeCompare(a.name));
  resultCount.textContent=list.length;
  empty.hidden=list.length>0;
  grid.hidden=list.length===0;
  grid.innerHTML=list.map(p=>{
    const color=TYPE_COLORS[p.types[0]];
    return `<article class="pokemon-card" style="--type:${color}" tabindex="0" data-id="${p.id}" aria-label="Abrir registro de ${p.name}">
      <span class="card-number">Nº ${String(p.id).padStart(3,'0')}</span>
      <button class="favorite ${favorites.has(p.id)?'on':''}" data-favorite="${p.id}" type="button" aria-label="${favorites.has(p.id)?'Remover':'Adicionar'} ${p.name} dos favoritos">${favorites.has(p.id)?'★':'☆'}</button>
      <img src="${imageUrl(p.id)}" alt="${p.name}" loading="lazy" width="300" height="300" />
      <div class="card-info"><h2>${p.name}</h2><div class="types">${typePills(p.types)}</div><div class="card-footer"><span>VER REGISTRO</span><span>↗</span></div></div>
    </article>`
  }).join('');
}

async function getDetails(id){
  if(detailsCache.has(id))return detailsCache.get(id);
  try{
    const [pokemonRes,speciesRes]=await Promise.all([fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)]);
    if(!pokemonRes.ok||!speciesRes.ok)throw new Error('Dados indisponíveis');
    const [pokemon,species]=await Promise.all([pokemonRes.json(),speciesRes.json()]);
    const flavorPt=species.flavor_text_entries.find(x=>x.language.name==='pt-br')||species.flavor_text_entries.find(x=>x.language.name==='en');
    const genus=species.genera.find(x=>x.language.name==='pt-br')||species.genera.find(x=>x.language.name==='en');
    const details={
      height:`${(pokemon.height/10).toLocaleString('pt-BR')} m`,weight:`${(pokemon.weight/10).toLocaleString('pt-BR')} kg`,
      abilities:pokemon.abilities.map(x=>x.ability.name.replaceAll('-',' ')),stats:pokemon.stats,
      flavor:flavorPt?.flavor_text.replace(/[\n\f]/g,' ')||FALLBACK_FLAVOR[id]||'Registro biológico deste Pokémon de Kanto.',
      category:genus?.genus||'Pokémon',baseExperience:pokemon.base_experience??'—'
    };
    detailsCache.set(id,details);return details;
  }catch(error){
    return{height:'—',weight:'—',abilities:['Dados offline'],stats:[],flavor:FALLBACK_FLAVOR[id]||'Este registro pertence à Pokédex original da região de Kanto.',category:'Pokémon de Kanto',baseExperience:'—'};
  }
}

function evolutionFor(id){return EVOLUTION_CHAINS.find(chain=>chain.includes(id))||[id]}
function evolutionMarkup(id){
  const chain=evolutionFor(id);
  if(chain.length===1)return `<div class="evolution-line"><p style="color:var(--muted);font-size:.85rem">Não possui evolução registrada na Pokédex de Kanto.</p></div>`;
  return `<div class="evolution-line">${chain.map((evoId,index)=>{
    const p=pokemonById(evoId);
    return `${index?'<span class="evo-arrow">›</span>':''}<button class="evo-item" type="button" data-evo="${evoId}"><img src="${imageUrl(evoId)}" alt="" loading="lazy"><span>${p.name}</span></button>`
  }).join('')}</div>`
}

async function openDetails(id){
  const p=pokemonById(id);if(!p)return;
  detailContent.innerHTML='<div class="loading-detail">Consultando registro…</div>';
  if(!dialog.open)dialog.showModal();
  const d=await getDetails(id);
  detailContent.innerHTML=`
    <section class="detail-hero" style="--type:${TYPE_COLORS[p.types[0]]}">
      <div class="detail-image"><img src="${imageUrl(p.id)}" alt="${p.name}"></div>
      <div class="detail-main"><span class="detail-kicker">Nº ${String(p.id).padStart(3,'0')} · ${d.category}</span><h2>${p.name}</h2><div class="types">${typePills(p.types)}</div><p class="flavor">${d.flavor}</p>
        <div class="quick-facts"><div><small>ALTURA</small><strong>${d.height}</strong></div><div><small>PESO</small><strong>${d.weight}</strong></div><div><small>EXP. BASE</small><strong>${d.baseExperience}</strong></div><div><small>HABILIDADES</small><strong>${d.abilities.join(' · ')}</strong></div></div>
      </div>
    </section>
    <section class="detail-body" style="--type:${TYPE_COLORS[p.types[0]]}">
      <div><h3 class="panel-title">Atributos base</h3><div class="stats">${d.stats.length?d.stats.map(s=>`<div class="stat-row"><span>${STAT_LABELS[s.stat.name]||s.stat.name}</span><b>${s.base_stat}</b><div class="stat-bar"><i style="width:${Math.min(100,s.base_stat/1.6)}%"></i></div></div>`).join(''):'<p style="color:var(--muted);font-size:.85rem">Conecte-se à internet para consultar os atributos.</p>'}</div></div>
      <div><h3 class="panel-title">Linha evolutiva</h3>${evolutionMarkup(id)}</div>
    </section>`;
}

grid.addEventListener('click',event=>{
  const fav=event.target.closest('[data-favorite]');
  if(fav){event.stopPropagation();const id=Number(fav.dataset.favorite);favorites.has(id)?favorites.delete(id):favorites.add(id);saveFavorites();render();return}
  const card=event.target.closest('[data-id]');if(card)openDetails(Number(card.dataset.id));
});
grid.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&!event.target.closest('button')){event.preventDefault();openDetails(Number(event.target.closest('[data-id]')?.dataset.id))}});
detailContent.addEventListener('click',event=>{const evo=event.target.closest('[data-evo]');if(evo)openDetails(Number(evo.dataset.evo))});
document.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
[search,typeFilter,sortSelect].forEach(el=>el.addEventListener(el===search?'input':'change',render));
favoritesBtn.addEventListener('click',()=>{onlyFavorites=!onlyFavorites;favoritesBtn.classList.toggle('active',onlyFavorites);favoritesBtn.setAttribute('aria-pressed',String(onlyFavorites));favoritesBtn.textContent=onlyFavorites?'★ Exibindo favoritos':'☆ Só favoritos';render()});
document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-view]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');grid.classList.toggle('compact',btn.dataset.view==='compact')}));
document.addEventListener('keydown',event=>{if(event.key==='/'&&document.activeElement!==search){event.preventDefault();search.focus()}});

saveFavorites();render();
