<script setup lang="ts">
var data = [
  {
    "title": "1: Blog Post",
    "slug": "1-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor."
  },
  {
    "title": "2: Photo",
    "slug": "2-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel .",
    "src": "https://assets.codepen.io/881020/dog1.jpg",
    "isThumb": true
  },
  {
    "title": "3: Photo",
    "slug": "3-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, conse",
    "src": "https://assets.codepen.io/881020/dog2.jpg",
    "isThumb": true
  },
  {
    "title": "4: Project",
    "slug": "4-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.",
    "src": "https://assets.codepen.io/881020/dog3.jpg",
    "isThumb": false
  },
  {
    "title": "5: Project",
    "slug": "5-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem, nec convallis ligula. Quisque maximus ",
    "src": "https://assets.codepen.io/881020/dog4.jpg",
    "isThumb": false
  },
  {
    "title": "6: Blog Post",
    "slug": "6-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibhLorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh"
  },
  {
    "title": "7: Project",
    "slug": "7-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.",
    "src": "https://assets.codepen.io/881020/dog5.jpg",
    "isThumb": false
  },
  {
    "title": "8: Blog Post",
    "slug": "8-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Semper ut risus. "
  },
  {
    "title": "9: Photo",
    "slug": "9-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis",
    "src": "https://assets.codepen.io/881020/dog2.jpg",
    "isThumb": true
  },
  {
    "title": "10: Blog Post",
    "slug": "10-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. "
  },
  {
    "title": "11: Photo",
    "slug": "11-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam,",
    "src": "https://assets.codepen.io/881020/dog9.jpg",
    "isThumb": true
  },
  {
    "title": "12: Project",
    "slug": "12-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam,",
    "src": "https://assets.codepen.io/881020/dog10.jpg",
    "isThumb": false
  },
  {
    "title": "13: Blog Post",
    "slug": "13-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor."
  },
  {
    "title": "14: Photo",
    "slug": "14-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel .",
    "src": "https://assets.codepen.io/881020/dog1.jpg",
    "isThumb": true
  },
  {
    "title": "15: Photo",
    "slug": "15-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, conse",
    "src": "https://assets.codepen.io/881020/dog2.jpg",
    "isThumb": true
  },
  {
    "title": "16: Project",
    "slug": "16-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.",
    "src": "https://assets.codepen.io/881020/dog3.jpg",
    "isThumb": false
  },
  {
    "title": "17: Project",
    "slug": "17-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem, nec convallis ligula. Quisque maximus ",
    "src": "https://assets.codepen.io/881020/dog4.jpg",
    "isThumb": false
  },
  {
    "title": "18: Blog Post",
    "slug": "18-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibhLorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh"
  },
  {
    "title": "19: Project",
    "slug": "19-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam,",
    "src": "https://assets.codepen.io/881020/dog10.jpg",
    "isThumb": false
  },
  {
    "title": "20: Blog Post",
    "slug": "20-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor."
  },
  {
    "title": "21: Photo",
    "slug": "21-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel .",
    "src": "https://assets.codepen.io/881020/dog1.jpg",
    "isThumb": true
  },
  {
    "title": "22: Photo",
    "slug": "22-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, conse",
    "src": "https://assets.codepen.io/881020/dog2.jpg",
    "isThumb": true
  },
  {
    "title": "23: Project",
    "slug": "23-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.",
    "src": "https://assets.codepen.io/881020/dog3.jpg",
    "isThumb": false
  },
  {
    "title": "24: Project",
    "slug": "24-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem, nec convallis ligula. Quisque maximus ",
    "src": "https://assets.codepen.io/881020/dog4.jpg",
    "isThumb": false
  },
  {
    "title": "25: Blog Post",
    "slug": "25-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibhLorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh"
  },
  {
    "title": "26: Project",
    "slug": "26-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.",
    "src": "https://assets.codepen.io/881020/dog5.jpg",
    "isThumb": false
  },
  {
    "title": "27: Project",
    "slug": "27-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.",
    "src": "https://assets.codepen.io/881020/dog5.jpg",
    "isThumb": false
  },
  {
    "title": "28: Blog Post",
    "slug": "28-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Semper ut risus. "
  },
  {
    "title": "29: Photo",
    "slug": "29-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis",
    "src": "https://assets.codepen.io/881020/dog2.jpg",
    "isThumb": true
  },
  {
    "title": "30: Blog Post",
    "slug": "30-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. "
  },
  {
    "title": "31: Photo",
    "slug": "31-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam,",
    "src": "https://assets.codepen.io/881020/dog9.jpg",
    "isThumb": true
  },
  {
    "title": "32: Blog Post",
    "slug": "32-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Semper ut risus. "
  },
  {
    "title": "33: Photo",
    "slug": "33-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis",
    "src": "https://assets.codepen.io/881020/dog2.jpg",
    "isThumb": true
  },
  {
    "title": "34: Blog Post",
    "slug": "34-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. "
  },
  {
    "title": "35: Photo",
    "slug": "35-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam,",
    "src": "https://assets.codepen.io/881020/dog9.jpg",
    "isThumb": true
  },
  {
    "title": "36: Project",
    "slug": "36-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam,",
    "src": "https://assets.codepen.io/881020/dog10.jpg",
    "isThumb": false
  },
  {
    "title": "37: Blog Post",
    "slug": "37-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor."
  },
  {
    "title": "38: Photo",
    "slug": "38-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel .",
    "src": "https://assets.codepen.io/881020/dog1.jpg",
    "isThumb": true
  },
  {
    "title": "39: Photo",
    "slug": "39-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, conse",
    "src": "https://assets.codepen.io/881020/dog2.jpg",
    "isThumb": true
  },
  {
    "title": "40: Project",
    "slug": "40-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.",
    "src": "https://assets.codepen.io/881020/dog3.jpg",
    "isThumb": false
  },
  {
    "title": "41: Project",
    "slug": "41-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem, nec convallis ligula. Quisque maximus ",
    "src": "https://assets.codepen.io/881020/dog4.jpg",
    "isThumb": false
  },
  {
    "title": "42: Blog Post",
    "slug": "42-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibhLorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh"
  },
  {
    "title": "43: Project",
    "slug": "43-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.",
    "src": "https://assets.codepen.io/881020/dog5.jpg",
    "isThumb": false
  },
  {
    "title": "44: Blog Post",
    "slug": "44-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Semper ut risus. "
  },
  {
    "title": "45: Photo",
    "slug": "45-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis",
    "src": "https://assets.codepen.io/881020/dog2.jpg",
    "isThumb": true
  },
  {
    "title": "46: Blog Post",
    "slug": "46-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. "
  },
  {
    "title": "47: Photo",
    "slug": "47-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam,",
    "src": "https://assets.codepen.io/881020/dog9.jpg",
    "isThumb": true
  },
  {
    "title": "48: Project",
    "slug": "48-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam,",
    "src": "https://assets.codepen.io/881020/dog10.jpg",
    "isThumb": false
  },
  {
    "title": "49: Blog Post",
    "slug": "49-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor."
  },
  {
    "title": "50: Photo",
    "slug": "50-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel .",
    "src": "https://assets.codepen.io/881020/dog1.jpg",
    "isThumb": true
  },
  {
    "title": "51: Photo",
    "slug": "51-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, conse",
    "src": "https://assets.codepen.io/881020/dog2.jpg",
    "isThumb": true
  },
  {
    "title": "52: Project",
    "slug": "52-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.",
    "src": "https://assets.codepen.io/881020/dog3.jpg",
    "isThumb": false
  },
  {
    "title": "53: Project",
    "slug": "53-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem, nec convallis ligula. Quisque maximus ",
    "src": "https://assets.codepen.io/881020/dog4.jpg",
    "isThumb": false
  },
  {
    "title": "54: Blog Post",
    "slug": "54-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibhLorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh"
  },
  {
    "title": "55: Project",
    "slug": "55-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.",
    "src": "https://assets.codepen.io/881020/dog5.jpg",
    "isThumb": false
  },
  {
    "title": "56: Blog Post",
    "slug": "56-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Semper ut risus. "
  },
  {
    "title": "57: Photo",
    "slug": "57-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis",
    "src": "https://assets.codepen.io/881020/dog2.jpg",
    "isThumb": true
  },
  {
    "title": "58: Blog Post",
    "slug": "58-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. "
  },
  {
    "title": "59: Photo",
    "slug": "59-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam,",
    "src": "https://assets.codepen.io/881020/dog9.jpg",
    "isThumb": true
  },
  {
    "title": "60: Project",
    "slug": "60-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem, nec convallis ligula. Quisque maximus ",
    "src": "https://assets.codepen.io/881020/dog4.jpg",
    "isThumb": false
  },
  {
    "title": "61: Blog Post",
    "slug": "61-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibhLorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh"
  },
  {
    "title": "62: Project",
    "slug": "62-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.",
    "src": "https://assets.codepen.io/881020/dog5.jpg",
    "isThumb": false
  },
  {
    "title": "63: Blog Post",
    "slug": "63-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Semper ut risus. "
  },
  {
    "title": "64: Photo",
    "slug": "64-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis",
    "src": "https://assets.codepen.io/881020/dog2.jpg",
    "isThumb": true
  },
  {
    "title": "65: Blog Post",
    "slug": "65-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. "
  },
  {
    "title": "66: Photo",
    "slug": "66-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam,",
    "src": "https://assets.codepen.io/881020/dog9.jpg",
    "isThumb": true
  },
  {
    "title": "67: Project",
    "slug": "67-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam,",
    "src": "https://assets.codepen.io/881020/dog10.jpg",
    "isThumb": false
  },
  {
    "title": "68: Blog Post",
    "slug": "68-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor."
  },
  {
    "title": "69: Photo",
    "slug": "69-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel .",
    "src": "https://assets.codepen.io/881020/dog1.jpg",
    "isThumb": true
  },
  {
    "title": "70: Photo",
    "slug": "70-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, conse",
    "src": "https://assets.codepen.io/881020/dog2.jpg",
    "isThumb": true
  },
  {
    "title": "71: Project",
    "slug": "71-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.",
    "src": "https://assets.codepen.io/881020/dog3.jpg",
    "isThumb": false
  },
  {
    "title": "72: Project",
    "slug": "72-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem, nec convallis ligula. Quisque maximus ",
    "src": "https://assets.codepen.io/881020/dog4.jpg",
    "isThumb": false
  },
  {
    "title": "73: Blog Post",
    "slug": "73-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibhLorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh"
  },
  {
    "title": "74: Project",
    "slug": "74-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.",
    "src": "https://assets.codepen.io/881020/dog5.jpg",
    "isThumb": false
  },
  {
    "title": "75: Project",
    "slug": "75-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam,",
    "src": "https://assets.codepen.io/881020/dog10.jpg",
    "isThumb": false
  },
  {
    "title": "76: Blog Post",
    "slug": "76-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor."
  },
  {
    "title": "77: Photo",
    "slug": "77-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel .",
    "src": "https://assets.codepen.io/881020/dog1.jpg",
    "isThumb": true
  },
  {
    "title": "78: Photo",
    "slug": "78-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, conse",
    "src": "https://assets.codepen.io/881020/dog2.jpg",
    "isThumb": true
  },
  {
    "title": "79: Project",
    "slug": "79-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.",
    "src": "https://assets.codepen.io/881020/dog3.jpg",
    "isThumb": false
  },
  {
    "title": "80: Project",
    "slug": "80-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem, nec convallis ligula. Quisque maximus ",
    "src": "https://assets.codepen.io/881020/dog4.jpg",
    "isThumb": false
  },
  {
    "title": "81: Blog Post",
    "slug": "81-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibhLorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh"
  },
  {
    "title": "82: Project",
    "slug": "82-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.",
    "src": "https://assets.codepen.io/881020/dog5.jpg",
    "isThumb": false
  },
  {
    "title": "83: Blog Post",
    "slug": "83-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Semper ut risus. "
  },
  {
    "title": "84: Photo",
    "slug": "84-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis",
    "src": "https://assets.codepen.io/881020/dog2.jpg",
    "isThumb": true
  },
  {
    "title": "85: Blog Post",
    "slug": "85-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. "
  },
  {
    "title": "86: Photo",
    "slug": "86-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam,",
    "src": "https://assets.codepen.io/881020/dog9.jpg",
    "isThumb": true
  },
  {
    "title": "87: Project",
    "slug": "87-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam,",
    "src": "https://assets.codepen.io/881020/dog10.jpg",
    "isThumb": false
  },
  {
    "title": "88: Blog Post",
    "slug": "88-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor."
  },
  {
    "title": "89: Photo",
    "slug": "89-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel .",
    "src": "https://assets.codepen.io/881020/dog1.jpg",
    "isThumb": true
  },
  {
    "title": "90: Photo",
    "slug": "90-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, conse",
    "src": "https://assets.codepen.io/881020/dog2.jpg",
    "isThumb": true
  },
  {
    "title": "91: Project",
    "slug": "91-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.",
    "src": "https://assets.codepen.io/881020/dog3.jpg",
    "isThumb": false
  },
  {
    "title": "92: Blog Post",
    "slug": "92-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Semper ut risus. "
  },
  {
    "title": "93: Photo",
    "slug": "93-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis",
    "src": "https://assets.codepen.io/881020/dog2.jpg",
    "isThumb": true
  },
  {
    "title": "94: Blog Post",
    "slug": "94-blog-post",
    "type": "blog",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. "
  },
  {
    "title": "95: Photo",
    "slug": "95-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam,",
    "src": "https://assets.codepen.io/881020/dog9.jpg",
    "isThumb": true
  },
  {
    "title": "96: Project",
    "slug": "96-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam,",
    "src": "https://assets.codepen.io/881020/dog10.jpg",
    "isThumb": false
  },
  {
    "title": "97: Photo",
    "slug": "97-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel .",
    "src": "https://assets.codepen.io/881020/dog1.jpg",
    "isThumb": true
  },
  {
    "title": "98: Photo",
    "slug": "98-photo",
    "type": "photo",
    "text": "Lorem ipsum dolor sit amet, conse",
    "src": "https://assets.codepen.io/881020/dog2.jpg",
    "isThumb": true
  },
  {
    "title": "99: Project",
    "slug": "99-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dictum non orci ut dignissim. Fusce fermentum felis aliquam, mattis nibh ut, faucibus leo. Sed lectus libero, volutpat at eros quis, venenatis tempus neque. Nulla vel faucibus orci, nec convallis ligula. Quisque maximus gravida orci, in lacinia mauris pretium nec. Sed et enim bibendum, fermentum tellus eu, eleifend ex. Aliquam lectus magna, sollicitudin vitae placerat ac, semper ut risus. Nunc vestibulum lacus et nulla volutpat auctor.",
    "src": "https://assets.codepen.io/881020/dog3.jpg",
    "isThumb": false
  },
  {
    "title": "100: Project",
    "slug": "100-project",
    "type": "project",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce facilisis fringilla laoreet. Mauris mattis enim ut felis consectetur, vitae lacinia enim auctor. Aenean vitae fermentum odio. Lorem, nec convallis ligula. Quisque maximus ",
    "src": "https://assets.codepen.io/881020/dog4.jpg",
    "isThumb": false
  }
];

// Add isLoaded so we can run resize on all the image elements.
// isProcessed is used to check if item has been resized.
const projects = reactive(data.map((project: any) => (
  (project.src) ? { ...project, isLoaded: false, isProcessed: false } : { ...project, isLoaded: true, isProcessed: false }
)))

function resizeGridItem(item: any) {
  var grid = document.getElementsByClassName('grid')[0];
  const slug = item.id;

  var rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
  if (!projects.find(item => item.slug == slug)?.isProcessed) {
    grid.style.gridAutoRows = '1px';
    item.style.gridRowEnd = 'span ' + rowHeight;
  }

  var rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
  if (!item.querySelector('.content'))
    return;
  var rowSpan = Math.ceil((item.querySelector('.content').getBoundingClientRect().height+rowGap)/(rowHeight+rowGap));
  const currentGridRowEndSpan = parseInt(window.getComputedStyle(item).gridRowEnd.replace('span ', ''))

  var raf = typeof window !== 'undefined' && 'requestAnimationFrame' in window ? window.requestAnimationFrame : function(func: Function) { setTimeout(func, 16) };
  const ease = (options: any) => { var startValue = 'startValue' in options ? options.startValue : 0; var endValue = 'endValue' in options ? options.endValue : 1; var durationMs = 'durationMs' in options ? options.durationMs : 200; var onComplete = options.onComplete || function() {}; var stepCount = durationMs / 16; var valueIncrement = (endValue - startValue) / stepCount; var sinValueIncrement = Math.PI / stepCount; var currentValue = startValue; var currentSinValue = 0; function step() { currentSinValue += sinValueIncrement; currentValue += valueIncrement * Math.pow(Math.sin(currentSinValue), 2) * 2; if (currentSinValue < Math.PI) { options.onStep(currentValue); raf(step); } else { options.onStep(endValue); onComplete(); } } raf(step); }

  if (currentGridRowEndSpan != rowSpan) {
    projects.find(item => item.slug == slug).isProcessed = true
    ease({
      startValue: currentGridRowEndSpan,
      endValue: rowSpan,
      durationMs: 1000,
      onStep: (value: number) => {
        item.style.gridRowEnd = 'span ' + Math.round(value)
      },
      onComplete: (value: number) => {
        item.style.gridRowEnd = 'span ' + rowSpan
      },
    });
  }
}

function resizeAllGridItems() {
  var allItems = document.getElementsByClassName('item');
  for(var x=0; x < allItems.length; x++){
      resizeGridItem(allItems[x]);
  }
}

function load(event: Event) {
  const parent = event?.currentTarget?.parentNode?.parentNode
  if (process.client) {
    resizeGridItem(parent)
  }
}

// Run once on window load, and once again after 1,3,7,10 seconds as fallback to ensure it loaded.
if (process.client) {
  window.onload = () => {
    resizeAllGridItems()
  }
  window.setTimeout(resizeAllGridItems, 1000)
  window.setTimeout(resizeAllGridItems, 3000)
  window.setTimeout(resizeAllGridItems, 7000)
  window.setTimeout(resizeAllGridItems, 10000)
}
</script>

<template>
  <Head>
    <Title>iMoz - Code</Title>
  </Head>
  <div class="mt-3 sm:mt-12">
    <h2 class="text-black dark:text-white text-3xl font-semibold my-2 sm:my-6 w-full text-center sm:text-left">Client Projects</h2>

      <div @load="resizeAllGridItems" class="grid">
        <div :id="project.slug" v-for="project in projects" v-bind:key="project.slug" :class="project.type" class="item">
          <div class="content">
            <div class="title">
              <h3>{{ project.title }}</h3>
            </div>
            <img @load="load" v-if="project.isThumb" loading="lazy" class="photothumb" :src="project.src" />
            <div class="desc">
              <img @load="load" v-if="project.src && !project.isThumb" :src="project.src">
              <p>{{ project.text }}</p>
            </div>
          </div>
        </div>
      </div>

  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(250px,1fr));
  grid-auto-rows: 58px;
}

.item {
  background-color: #ffffff;
}

.photothumb {
  width: 100%;
}

.title {
  padding: 20px;
 }

.title h3{
  font-size: 1.2em;
  color: #ffffff;
  text-transform: uppercase;
}

.project .title{
  background-color: #607D8B;
}

.blog .title{
  background-color: #ff9800;
}

.photo .title{
  background-color: #f44336;
}

.desc{
  padding: 10px 10px 5px 10px;
}

.desc img{
  width: 50%;
  margin: 0 10px 10px 0;
  float: left;
}

.desc p{
  margin-bottom: 10px;
}
</style>