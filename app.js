
const fccAPIurl='https://forum-proxy.freecodecamp.rocks/latest'
const iconSize=25

$(documentReady)

function documentReady(){
  $.get(fccAPIurl, onDataLoad)
}

function onDataLoad(data){

  //parse users data
  const users=data.users.map(({username, avatar_template, id})=>{
    avatar_template=avatar_template.replace('{size}', iconSize)
    const img=/^https/.test(avatar_template) ? avatar_template : 'https://forum.freecodecamp.org'+avatar_template
    return ({username, img, id})
  })

  //take a set of user id's and transforms them into profile links
  function getUsers(ids){
    return ids.map(({user_id})=>{
      return userLink(users.find(({id})=>id===user_id))
    }).join('')
  }

  //display active users count
  const usersCount=users.length
  $('#count').text(usersCount)

  //take current time to measure topics last activity
  const currentTime=Date.now()

  //parse topics data
  const topics=data.topic_list.topics.map(({title, id, slug, posters, posts_count, views, bumped_at}, i)=>{
    let postTime=Date.parse(bumped_at)
    postTime=Math.floor((currentTime-postTime)/60000)
    
    return {title, id, slug, views, posters: getUsers(posters), replies: posts_count, number: i+1, activity: parseDate(postTime)}
  })


  /* create & render active users icons and topics */

  const topicsList=topics.map(topic=>topicFrame(topic))
  const usersOnline=users.map(user=>{
    return userLink(user)
  })

  $('#active-users').append(...usersOnline)
  $('#topics-container').append(...topicsList)
}

function userLink({img, username}){
  
  return `<a href='https://forum.freecodecamp.org/u/${username}' title=${username} class='user-icon'>
  <img src='${img}'></img>
  </a>`
}

function topicFrame({title, id, slug, number, posters, replies, views, activity}){
  
  return `<article class='topic'>
    <div>${number}</div>
    <a href="https://forum.freecodecamp.org/t/${slug}/${id}">
      ${title}
    </a>
    <div class='participants'>${posters}</div>
    <div>${replies-1}</div>
    <div>${views}</div>
    <div>${activity}</div>
  </article>`
}

function parseDate(minutes){
  if (minutes>1439) return Math.floor(minutes/1440)+'d'
  if (minutes>59) return Math.floor(minutes/60)+'h'
  return minutes+'m'
}