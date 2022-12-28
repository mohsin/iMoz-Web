<script setup lang="ts">
var projects = (await queryContent('/data/projects').findOne());

['client', 'opensource', 'others'].forEach((type) => {
  projects[type].forEach((project) => {
    try {
      (queryContent('/data/projects/' + project.slug).findOne())
    } catch(ex: any) {}
  })
})
</script>
