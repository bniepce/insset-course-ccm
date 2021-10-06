<template>
  <div class="hello">
    <div class="row">
      <div  v-for="article in articles" :key="article._id"  class="col s3">
        <div class="card darken-1">
          <div class="card-content white-text">
            <span class="card-title">{{article.title}}</span>
          </div>
          <div class="card-action">
            <a href="#">Read</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Index',
  data () {
    return {
      'articles': []
    }
  },
  mounted(){
    let api_url = process.env.API_URL || 'node-server:3000'
    axios.get(api_url)
      .then(response => {
        this.articles = response.data;
        console.log(this.articles)
    })
    .catch((error)=> {
        this.error = error;
    });
  },
}
</script>

<style scoped>
.card-title{
  color:black
}

</style>