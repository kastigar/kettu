var InfoHelpers = {
  closeInfo: function() {
    if(transmission.info_interval_id) { clearInterval(transmission.info_interval_id); }
    if(transmission.update_settings_interval_id) { clearInterval(transmission.update_settings_interval_id); }
    this.saveLastMenuItem($('.menu-item.active'));
    $('.main').removeClass('info');
    $('#info').hide();
    return false;
  },

  openInfo: function(view) {
    var info = $('#info'),
      context = this;

    info.html(view);
    // NOTE: if there's a way in CSS to fix this without using JS, that'd be preferable
    if(transmission.mobile) {
      info.css('height', $(document).height());
      info.css('width', $(document).width());
      info.prepend('<div id="buttonbar"><div class="button"><span class="back"></span><a href="#/torrents" class="back">Back</a></div></div>');
      info.find('.back').click(function() {
        context.closeInfo();
        context.redirect('#/torrents');
      });
    } else {
      info.css('left', ($(window).width() / 2) - ($('#container').width() / 2) + 550);
    }
    info.show();
    $('.main').addClass('info');
    this.menuizeInfo();
  },

  infoIsOpen: function() {
    return $('.main').hasClass('info');
  },

  handleDoubleClickOnTorrent: function(torrent) {
    var context = this;
    $('#' + torrent.id).dblclick(function(event) {
      if(context.infoIsOpen()) {
        context.closeInfo(context);
      } else {
        var active_torrent = $('.torrent.active');
        if(active_torrent.length > 0) {
          context.redirect('#/torrent_details/' + active_torrent.attr('id'));
        }        
      }
      event.preventDefault();
    });
  },
  
  // NOTE: make this smaller and more readable
  handleClickOnTorrent: function(torrent) {
    var context = this;
    $('#' + torrent.id).click(function(e) {
      // NOTE: why is this necessary? somehow safari does not stop propagation on a context menu event.
      if($('#context_menu').is(':visible')) { return false; }
      
      if(e.shiftKey && $('.torrent.active').length >= 1) {
        var first_index = $('.torrent.active:first').index();
        var last_index = $('.torrent').index($(this));

        if(first_index > last_index) {
          first_index = last_index;
          last_index = $('.torrent.active:last').index();
        }

        var torrents = $('.torrent:lt(' + (last_index + 1) + ')');
        if(first_index > 0) { torrents = torrents.filter(':gt(' + (first_index - 1) + ')'); }

        context.highlightTorrents(torrents);
        if(context.infoIsOpen()) { context.redirect('#/torrent_details'); }
        $('#search').focus();          
      } else if(e.metaKey && $('.torrent.active').length >= 1) {
        $(this).toggleClass('active');
        if(context.infoIsOpen()) { context.redirect('#/torrent_details'); }
      } else {
        context.highlightTorrents($(this));
        if(context.infoIsOpen()) {
          context.saveLastMenuItem($('.menu-item.active'));
          window.location = '#/torrent_details/' + $(this).attr('id');
          // NOTE: a redirect seems to interfere with our double click handling here
        }        
      }
    });
  },

  updateInfo: function(torrent) {
    this.trigger('changed');
    this.handleClickOnTorrent(torrent);
    this.handleDoubleClickOnTorrent(torrent);
  },
  
  activateInfoInputs: function(torrent) {
    $('#info input').change(function() {
      $(this).parents('form:first').trigger('submit');
      return false;
    });

    $('#info select').change(function() {
      if($(this).hasClass('locationCategory')) {
        if($(this).val() == '__custom__') {
          $('#info .location-field').show();
          return false;
        } else {
          $('#info .location-field').hide();
          $('#info .location-field input').val($(this).val());
        }
      }
      $(this).parents('form:first').trigger('submit');
      if($(this).hasClass('seedRatioMode')) {
        if($(this).val() == 1) {
          $('#info .seedRatioLimit').show();
        } else {
          $('#info .seedRatioLimit').hide();
        }
      }
      return false;
    });
    
    $('#info .bandwidthPriority').val(torrent.bandwidthPriority);
    $('#info .seedRatioMode').val(torrent.seedRatioMode);

    if(torrent.seedRatioMode == 1) {
      $('#info .seedRatioLimit').show();
    } else {
      $('#info .seedRatioLimit').hide();
    }

    if ($('#info .locationCategory').length > 0) {
      $('#info .locationCategory').val(torrent.downloadDir);

      if ($('#info .locationCategory').val() != torrent.downloadDir) {
          $('#info .locationCategory').val('__custom__');
          $('#info .location-field').show();
      } else {
          $('#info .location-field').hide();
      }
    }
  },

  activateFileInputs: function() {
    $('#info .file').change(function() {
      $(this).parents('form:first').trigger('submit');
      return false;
    });
    $('#info .files .select_all').click(function() {
      $('#info .file:not(:disabled)').attr('checked', true);
      $('#info .files form').submit();
      return false;
    });
    $('#info .files .deselect_all').click(function() {
      $('#info .file:not(:disabled)').attr('checked', false);
      $('#info .files form').submit();
      return false;
    });
    $('#info .folder').click(function() {
      $(this).nextAll('.files_in_folders:first').slideToggle();
      var arrow = $(this).find('.arrow');
      if(arrow.attr('src').match(/right/)) {
        arrow.attr('src', 'css/images/arrow_down.png');
      } else {
        arrow.attr('src', 'css/images/arrow_right.png');
      }
      return false;
    });
  },
  
  startCountDownOnNextAnnounce: function() {
    var context = this;
    var timer = setInterval(function() {
      var timestamp = $('.countdown').attr('data-timestamp');
      var formatted = context.formatNextAnnounceTime(timestamp);
      
      if(formatted.match(/59 min/)) {
        clearInterval(timer);
        context.saveLastMenuItem($('.menu-item.active'));
        context.closeInfo(context);
        context.openInfo();
      } else {
        $('.countdown').text(formatted);
      }
    }, 980);
  }
};
