import Ember from 'ember';

export default Ember.Service.extend({
    ajax: Ember.inject.service(),

    cloud: 'optimize',
    preset: 'g8xb7oqg',

    showInput(){
        let service = this;
        let input = document.createElement('input');
        input.type="file";
        input.style.position = 'absolute';
        input.style.top = '-100px';
        input.multiple = 'multiple';

        let promise = new Ember.RSVP.Promise(function(resolve, reject){
            input.onchange = function(){
                resolve(service.upload(this.files));
            };
            setTimeout(reject, 20000);
        });

        document.body.appendChild(input);

        input.click();

        return {
            input,
            promise,
            destroy: () => this.destroy(input)
        };
    },
    upload(files){
        let ajax = this.get('ajax');
        let cloud = this.get('cloud');
        let preset = this.get('preset');

        function uploadFile(file){
            var formData = new FormData();
            formData.append('callback', '/cloudinary_cors.html');
            formData.append('upload_preset', preset);
            formData.append('file', file);

            return ajax.post(`https://api.cloudinary.com/v1_1/${cloud}/auto/upload`, {
                data: formData,
                processData: false,
                contentType: false,
                maxFileSize: 20000000,
                dataType: 'json',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
        }

        return new Ember.RSVP.Promise(function (resolve, reject) {
            let filesArr = [];
            for(let i = 0; i< files.length; i++){
                filesArr.push(files[i]);
            }
            Ember.RSVP.all(filesArr.map(uploadFile)).then(resolve, reject);
        });

    },
    destroy(input){
        document.body.removeChild(input);
    }
});
